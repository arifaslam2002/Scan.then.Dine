import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ChefHat,
  Utensils,
  Table2,
  QrCode,
  Plus,
  Search,
  IndianRupee,
  ShoppingBag,
  Flame,
  CheckCircle2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import socket from "../../services/socket";
import LogoutButton from "../../components/LogoutButton";
import api from "../../services/api";

/* ---------- helpers ---------- */

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    chip: "bg-amber-50 text-amber-700",
  },
  confirmed: {
    label: "Confirmed",
    color: "#3b82f6",
    chip: "bg-blue-50 text-blue-700",
  },
  preparing: {
    label: "Preparing",
    color: "#f97316",
    chip: "bg-orange-50 text-orange-700",
  },
  ready: {
    label: "Ready",
    color: "#8b5cf6",
    chip: "bg-violet-50 text-violet-700",
  },
  served: {
    label: "Served",
    color: "#10b981",
    chip: "bg-emerald-50 text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    chip: "bg-red-50 text-red-700",
  },
};

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kitchen", label: "Kitchen", icon: ChefHat },
  { to: "/menu", label: "Menu", icon: Utensils },
  { to: "/admin/tables", label: "Tables", icon: Table2 },
  { to: "/admin/parcel-qr", label: "Parcel QR", icon: QrCode },
];

const ChartTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{label ?? payload[0].name}</p>
      <p className="mt-0.5 text-gray-600">
        {prefix}
        {Number(payload[0].value).toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const Card = ({ title, subtitle, action, children, className = "" }) => (
  <section
    className={`rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm sm:p-6 ${className}`}
  >
    {(title || action) && (
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

const StatCard = ({ icon: Icon, label, value, hint, tone }) => (
  <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={18} />
      </span>
    </div>
    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

/* ---------- page ---------- */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  /* ----- data loading (same logic as before) ----- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data.orders || [],
        );
        const foodResponse = await api.get("/foods");
        setFoods(Array.isArray(foodResponse.data) ? foodResponse.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    const handleNewOrder = (newOrder) =>
      setOrders((prev) => [newOrder, ...prev]);

    const handleOrderStatusUpdate = (updated) =>
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );

    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusUpdated", handleOrderStatusUpdate);

    return () => {
      clearInterval(interval);
      socket.off("newOrder", handleNewOrder);
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
    };
  }, []);

  /* ----- actions ----- */
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? response.data.order : o)),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update order status");
    }
  };

  const updateFoodAvailability = async (foodId, available) => {
    try {
      const response = await api.patch(`/foods/${foodId}/availability`, {
        available,
      });
      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? response.data?.food || f : f)),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update food availability");
    }
  };

  const deleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this food?")) return;
    try {
      await api.delete(`/foods/${foodId}`);
      setFoods((prev) => prev.filter((f) => f._id !== foodId));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete food");
    }
  };

  /* ----- derived numbers ----- */
  const stats = useMemo(() => {
    const notCancelled = orders.filter((o) => o.status !== "cancelled");
    const todayStr = new Date().toDateString();

    const statusCounts = Object.keys(STATUS).reduce((acc, key) => {
      acc[key] = orders.filter((o) => o.status === key).length;
      return acc;
    }, {});

    const sum = (list) => list.reduce((t, o) => t + (o.totalAmount || 0), 0);

    // last 7 days sales
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const salesByDay = days.map((d) => {
      const dayOrders = notCancelled.filter(
        (o) => new Date(o.createdAt).toDateString() === d.toDateString(),
      );
      return {
        day:
          d.toDateString() === todayStr
            ? "Today"
            : d.toLocaleDateString("en-IN", { weekday: "short" }),
        revenue: sum(dayOrders),
        orders: dayOrders.length,
      };
    });

    return {
      total: orders.length,
      active: orders.filter((o) => !["served", "cancelled"].includes(o.status))
        .length,
      completed: statusCounts.served,
      cancelled: statusCounts.cancelled,
      revenue: sum(notCancelled),
      todayRevenue: sum(
        notCancelled.filter(
          (o) => new Date(o.createdAt).toDateString() === todayStr,
        ),
      ),
      statusCounts,
      salesByDay,
      activeRevenue: sum(
        orders.filter((o) => !["served", "cancelled"].includes(o.status)),
      ),
      completedRevenue: sum(orders.filter((o) => o.status === "served")),
      cancelledAmount: sum(orders.filter((o) => o.status === "cancelled")),
    };
  }, [orders]);

  const statusChart = Object.entries(stats.statusCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: STATUS[key].label,
      value: count,
      color: STATUS[key].color,
    }));

  const topFoods = useMemo(
    () =>
      [...foods]
        .sort((a, b) => (b.ordered || 0) - (a.ordered || 0))
        .slice(0, 5)
        .map((f) => ({ name: f.name, orders: f.ordered || 0 })),
    [foods],
  );

  const categories = useMemo(() => {
    const counts = foods.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [foods]);

  const availableFoods = foods.filter((f) => f.available).length;

  const filteredFoods = foods.filter(
    (f) =>
      (categoryFilter === "All" || f.category === categoryFilter) &&
      `${f.name} ${f.category}`
        .toLowerCase()
        .includes(foodSearch.toLowerCase()),
  );

  /* ----- loading ----- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f3]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-gray-900">
      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Utensils size={20} />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold">Scan.Then.Dine</h1>
              <p className="text-xs text-gray-500">Restaurant management</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  state={{ fromAdmin: true }}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <LogoutButton />
        </div>

        {/* mobile nav */}
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                state={{ fromAdmin: true }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {/* ---------- heading ---------- */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Live view of your orders, sales and menu.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/foods/new")}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus size={16} />
            Add new food
          </button>
        </div>

        {/* ---------- KPI cards ---------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={IndianRupee}
            label="Total revenue"
            value={money(stats.revenue)}
            hint={`Today: ${money(stats.todayRevenue)}`}
            tone="bg-orange-50 text-orange-600"
          />
          <StatCard
            icon={ShoppingBag}
            label="Total orders"
            value={stats.total}
            hint={`${stats.cancelled} cancelled`}
            tone="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Flame}
            label="Active orders"
            value={stats.active}
            hint="Being prepared right now"
            tone="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Served"
            value={stats.completed}
            hint={`${money(stats.completedRevenue)} earned`}
            tone="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* ---------- charts row 1 ---------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            title="Sales — last 7 days"
            subtitle="Revenue per day (cancelled orders excluded)"
            className="lg:col-span-2"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.salesByDay}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  />
                  <Tooltip content={<ChartTooltip prefix="₹" />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#revFill)"
                    dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Orders by status" subtitle="Where every order stands">
            {statusChart.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">
                No orders yet
              </p>
            ) : (
              <>
                <div className="relative h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChart}
                        dataKey="value"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {statusChart.map((s) => (
                          <Cell key={s.name} fill={s.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{stats.total}</span>
                    <span className="text-xs text-gray-500">orders</span>
                  </div>
                </div>

                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(STATUS).map(([key, s]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-gray-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        {s.label}
                      </span>
                      <span className="font-semibold">
                        {stats.statusCounts[key]}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        {/* ---------- charts row 2 ---------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            title="Most ordered foods"
            subtitle="Top 5 by number of orders"
            className="lg:col-span-2"
          >
            {topFoods.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">
                No food data yet
              </p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topFoods}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#eee"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#374151" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#fff7ed" }}
                      content={<ChartTooltip />}
                    />
                    <Bar dataKey="orders" radius={[0, 8, 8, 0]} barSize={22}>
                      {topFoods.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#f97316" : "#fdba74"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Money breakdown" subtitle="Where your revenue sits">
            <div className="space-y-4">
              {[
                {
                  label: "In progress",
                  value: stats.activeRevenue,
                  color: "#f97316",
                },
                {
                  label: "Completed",
                  value: stats.completedRevenue,
                  color: "#10b981",
                },
                {
                  label: "Cancelled",
                  value: stats.cancelledAmount,
                  color: "#ef4444",
                },
              ].map((row) => {
                const max = Math.max(
                  stats.activeRevenue,
                  stats.completedRevenue,
                  stats.cancelledAmount,
                  1,
                );
                return (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-gray-600">{row.label}</span>
                      <span className="font-semibold">{money(row.value)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(row.value / max) * 100}%`,
                          background: row.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-sm font-medium text-gray-700">
                Menu availability
              </p>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-red-100">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${foods.length ? (availableFoods / foods.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {availableFoods} available · {foods.length - availableFoods}{" "}
                hidden · {foods.length} total
              </p>
            </div>
          </Card>
        </div>

        {/* ---------- recent orders ---------- */}
        <Card
          title="Recent orders"
          subtitle="Latest 5 — change status right here"
        >
          {orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No orders yet. New orders will appear here instantly.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => {
                const s = STATUS[order.status] || STATUS.pending;
                return (
                  <div
                    key={order._id}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xs font-bold text-gray-700 ring-1 ring-gray-200">
                        T{order.tableNumber}
                      </span>
                      <div>
                        <p className="font-semibold">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerName} · Table {order.tableNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span className="text-base font-bold">
                        {money(order.totalAmount)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${s.chip}`}
                      >
                        {s.label}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-400"
                      >
                        {Object.entries(STATUS).map(([key, v]) => (
                          <option key={key} value={key}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ---------- menu management ---------- */}
        <Card
          title="Menu"
          subtitle={`${filteredFoods.length} of ${foods.length} items`}
          action={
            <button
              onClick={() => navigate("/admin/foods/new")}
              className="hidden items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:flex"
            >
              <Plus size={16} />
              Add food
            </button>
          }
        >
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search food or category…"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["All", ...categories.map(([c]) => c)].map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  categoryFilter === c
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c}
                {c !== "All" && (
                  <span className="ml-1.5 opacity-60">
                    {categories.find(([name]) => name === c)?.[1]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredFoods.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              No food matches your search. Try a different word or category.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFoods.map((food) => (
                <article
                  key={food._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200/70 bg-white transition hover:shadow-md"
                >
                  <div className="relative">
                    <img
                      src={food.image}
                      alt={food.name}
                      className={`h-44 w-full object-cover ${food.available ? "" : "grayscale"}`}
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
                        food.available
                          ? "bg-emerald-500/90 text-white"
                          : "bg-gray-900/80 text-white"
                      }`}
                    >
                      {food.available ? "Available" : "Hidden"}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{food.name}</h3>
                        <p className="text-sm text-gray-500">{food.category}</p>
                      </div>
                      {food.price != null && (
                        <p className="font-bold text-orange-600">
                          {money(food.price)}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateFoodAvailability(food._id, !food.available)
                        }
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          food.available
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}
                      >
                        {food.available ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                        {food.available ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/foods/edit/${food._id}`)
                        }
                        aria-label={`Edit ${food.name}`}
                        className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteFood(food._id)}
                        aria-label={`Delete ${food.name}`}
                        className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
