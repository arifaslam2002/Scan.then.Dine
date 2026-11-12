import api from "../../services/api";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  User,
  Phone,
  Users,
  Hash,
  ShoppingBag,
  StickyNote,
  Check,
  Flame,
  BellRing,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../../services/socket";
import LogoutButton from "../../components/LogoutButton";

/* ---------- role check ----------
   Back button is only for admins. Kitchen staff who log in directly never see it.
   ASSUMPTION: your login saves the role in localStorage, either as
   localStorage.role = "admin"  OR  localStorage.user = '{"role":"admin"}'.
   Change this function to match how your app stores it (context, redux, etc.). */
const getRole = () => {
  try {
    const direct = localStorage.getItem("role");
    if (direct) return direct;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || null;
  } catch {
    return null;
  }
};

/* ---------- status config ---------- */
const STATUS = {
  pending: {
    label: "Pending",
    accent: "bg-amber-400",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    action: {
      to: "confirmed",
      label: "Confirm order",
      icon: Check,
      btn: "bg-blue-600 hover:bg-blue-700",
    },
  },
  confirmed: {
    label: "Confirmed",
    accent: "bg-blue-500",
    chip: "bg-blue-50 text-blue-700 ring-blue-200",
    action: {
      to: "preparing",
      label: "Start preparing",
      icon: Flame,
      btn: "bg-orange-500 hover:bg-orange-600",
    },
  },
  preparing: {
    label: "Preparing",
    accent: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 ring-orange-200",
    action: {
      to: "ready",
      label: "Mark ready",
      icon: BellRing,
      btn: "bg-emerald-600 hover:bg-emerald-700",
    },
  },
  ready: {
    label: "Ready",
    accent: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 ring-violet-200",
    action: {
      to: "served",
      label: "Mark served",
      icon: CheckCheck,
      btn: "bg-gray-900 hover:bg-black",
    },
  },
  served: {
    label: "Served",
    accent: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    accent: "bg-red-400",
    chip: "bg-red-50 text-red-700 ring-red-200",
  },
};

const TABS = ["all", "pending", "confirmed", "preparing", "ready", "served"];

const timeAgo = (date) => {
  if (!date) return "";
  const mins = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 60000),
  );
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ${mins % 60} min ago`;
};

const itemTotal = (item) =>
  (item.price + (item.addons || []).reduce((sum, a) => sum + a.price, 0)) *
  item.quantity;

const KitchenDashboard = () => {
  const navigate = useNavigate();
  const isAdmin = getRole() === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [, setTick] = useState(0); // refreshes "x min ago" labels

  const filteredOrders =
    activeStatus === "all"
      ? orders
      : orders.filter((order) => order.status === activeStatus);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
        setError("");
      } catch (error) {
        console.error(error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    const clock = setInterval(() => setTick((t) => t + 1), 30000);

    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) => {
        const orderExists = prevOrders.some((o) => o._id === updatedOrder._id);
        if (orderExists) {
          return prevOrders.map((o) =>
            o._id === updatedOrder._id ? updatedOrder : o,
          );
        }
        return [updatedOrder, ...prevOrders];
      });
    };

    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);
    socket.on("newOrder", handleNewOrder);

    return () => {
      clearInterval(interval);
      clearInterval(clock);
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
      socket.off("newOrder", handleNewOrder);
    };
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === orderId ? response.data.order : o)),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update order status");
    }
  };

  const countOf = (status) =>
    status === "all"
      ? orders.length
      : orders.filter((o) => o.status === status).length;

  const newCount = countOf("pending");
  const cookingCount = countOf("preparing");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f3]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          Loading orders…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f3] p-6">
        <div className="max-w-sm rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>
          <p className="mt-1 text-sm text-gray-500">
            Check your connection, then reload the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Reload
          </button>
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
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                aria-label="Back to admin"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <ChefHat size={20} />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold">Kitchen</h1>
              <p className="text-xs text-gray-500">Scan.Then.Dine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* ---------- heading + quick counts ---------- */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Incoming orders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              New orders appear here automatically.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5">
              <p className="text-xs font-medium text-amber-700">Waiting</p>
              <p className="text-xl font-bold text-amber-800">{newCount}</p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2.5">
              <p className="text-xs font-medium text-orange-700">Cooking</p>
              <p className="text-xl font-bold text-orange-800">
                {cookingCount}
              </p>
            </div>
          </div>
        </div>

        {/* ---------- status tabs ---------- */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {TABS.map((status) => {
            const active = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status === "all" ? "All" : STATUS[status].label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {countOf(status)}
                </span>
              </button>
            );
          })}
        </div>

        {/* ---------- orders ---------- */}
        {filteredOrders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Inbox size={22} />
            </span>
            <h3 className="mt-4 text-base font-semibold text-gray-800">
              {orders.length === 0 ? "No orders yet" : "Nothing in this list"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length === 0
                ? "New customer orders will show up here."
                : "Pick another status above to see more orders."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => {
              const s = STATUS[order.status] || STATUS.pending;
              const isParcel = order.orderType === "parcel";
              const action = s.action;

              return (
                <article
                  key={order._id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm"
                >
                  <div className={`h-1.5 ${s.accent}`} />

                  <div className="flex flex-1 flex-col p-5">
                    {/* header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">
                          #{order._id.slice(-6).toUpperCase()}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={12} />
                          {timeAgo(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${s.chip}`}
                      >
                        {s.label}
                      </span>
                    </div>

                    {/* where / who */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                        {isParcel ? (
                          <ShoppingBag
                            size={15}
                            className="shrink-0 text-gray-400"
                          />
                        ) : (
                          <Hash size={15} className="shrink-0 text-gray-400" />
                        )}
                        <span className="truncate font-semibold">
                          {isParcel ? "Parcel" : `Table ${order.tableNumber}`}
                        </span>
                      </div>

                      {order.orderType === "dine-in" && order.guestCount ? (
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                          <Users size={15} className="shrink-0 text-gray-400" />
                          <span className="font-semibold">
                            {order.guestCount}{" "}
                            {order.guestCount === 1 ? "guest" : "guests"}
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                        <User size={15} className="shrink-0 text-gray-400" />
                        <span className="truncate">{order.customerName}</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                        <Phone size={15} className="shrink-0 text-gray-400" />
                        <span className="truncate">{order.phone}</span>
                      </div>
                    </div>

                    {order.orderType === "dine-in" && order.guestCount && (
                      <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-700">
                        Set up {order.guestCount}{" "}
                        {order.guestCount === 1 ? "place" : "places"}: plates,
                        cutlery and welcome drinks.
                      </p>
                    )}

                    {order.sessionId && (
                      <p className="mt-2 text-[11px] text-gray-400">
                        Session {order.sessionId}
                      </p>
                    )}

                    {/* items */}
                    <ul className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
                      {order.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <div className="flex min-w-0 gap-3">
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-900 px-1.5 text-xs font-bold text-white">
                              {item.quantity}×
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                ₹{item.price} each
                              </p>

                              {item.addons?.length > 0 && (
                                <ul className="mt-1.5 space-y-0.5">
                                  {item.addons.map((addon) => (
                                    <li
                                      key={addon.name}
                                      className="text-xs text-orange-600"
                                    >
                                      + {addon.name} (₹{addon.price})
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {item.note && (
                                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                                  <StickyNote
                                    size={13}
                                    className="mt-0.5 shrink-0"
                                  />
                                  {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="shrink-0 text-sm font-semibold">
                            ₹{itemTotal(item)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    {/* total + action */}
                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-sm font-medium text-gray-500">
                          Total
                        </span>
                        <span className="text-xl font-bold text-orange-600">
                          ₹{order.totalAmount}
                        </span>
                      </div>

                      {action && (
                        <button
                          onClick={() => updateStatus(order._id, action.to)}
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] ${action.btn}`}
                        >
                          <action.icon size={17} />
                          {action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDashboard;
