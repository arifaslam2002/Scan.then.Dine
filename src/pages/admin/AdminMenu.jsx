import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ChefHat,
  Utensils,
  Table2,
  QrCode,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import api from "../../services/api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kitchen", label: "Kitchen", icon: ChefHat },
  { to: "/admin/menu", label: "Menu", icon: Utensils },
  { to: "/admin/tables", label: "Tables", icon: Table2 },
  { to: "/admin/parcel-qr", label: "Parcel QR", icon: QrCode },
];

const AdminMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await api.get("/foods");
        setFoods(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f3]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          Loading menu…
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
              Menu
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add, edit, hide or remove dishes.
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

        {/* ---------- quick counts ---------- */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total items</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {foods.length}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Available</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
              {availableFoods}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Hidden from customers
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-red-500">
              {foods.length - availableFoods}
            </p>
          </div>
        </div>

        {/* ---------- search, filters, grid ---------- */}
        <section className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm sm:p-6">
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

          <p className="mt-4 text-sm text-gray-500">
            Showing {filteredFoods.length} of {foods.length} items
          </p>

          {filteredFoods.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              {foods.length === 0
                ? "No dishes yet. Use “Add new food” to create your first one."
                : "No food matches your search. Try a different word or category."}
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFoods.map((food) => (
                <article
                  key={food._id}
                  className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white transition hover:shadow-md"
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
        </section>
      </main>
    </div>
  );
};

export default AdminMenu;
