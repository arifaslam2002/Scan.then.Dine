import { useMemo, useState, useEffect } from "react";
import api from "../../services/api";
import {
  Search,
  ShoppingBag,
  Star,
  Flame,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const categories = ["All", "Grills", "Burgers", "Rice", "Curries", "Drinks"];

const allergyMap = {
  peanuts: ["peanut", "peanuts"],
  "tree-nuts": ["almond", "cashew", "pistachio", "walnut", "nuts"],
  dairy: ["milk", "cheese", "butter", "cream", "yogurt", "paneer"],
  egg: ["egg"],
  fish: ["fish"],
  shellfish: ["shellfish", "shrimp", "prawn", "crab"],
  soy: ["soy", "soya"],
  gluten: ["wheat", "flour", "bread"],
  sesame: ["sesame"],
};
const Menu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await api.get("/foods/available");
        setFoods(response.data);
        setError("");
        const savedTableNumber = localStorage.getItem("tableNumber") || "T-05";

        setTableNumber(savedTableNumber);
      } catch (error) {
        console.error(error);
        setError("Failed to load foods");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();

    const interval = setInterval(() => {
      fetchFoods();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

    setCart(savedCart);
  }, []);
  const [allergies] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerAllergies")) || [];
    } catch {
      return [];
    }
  });
  const safeFoods = useMemo(() => {
    return foods.filter((food) => {
      const unsafe = allergies.some((allergy) => {
        const restrictedIngredients = allergyMap[allergy] || [];

        return food.ingredients.some((ingredient) =>
          restrictedIngredients.includes(ingredient.toLowerCase()),
        );
      });

      return !unsafe;
    });
  }, [foods, allergies]);
  const filteredFoods = safeFoods.filter((food) => {
    const matchesCategory =
      activeCategory === "All" || food.category === activeCategory;
    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });
  const addToCart = (food) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = existingCart.find((item) => item._id === food._id);

    let updatedCart;

    if (existingItem) {
      updatedCart = existingCart.map((item) =>
        item._id === food._id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...food,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update React state
    setCart(updatedCart);
  };
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">
                You're dining at
              </p>

              <h1 className="mt-1 text-lg font-bold tracking-tight">
                The Garden Kitchen
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>

              <span className="text-sm font-medium text-orange-700">
                Table {tableNumber}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-black/5 bg-white py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-32 pt-6 sm:px-8">
        {/* Allergy status */}
        {allergies.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <ShieldCheck size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">
                Allergy-safe menu enabled
              </p>

              <p className="mt-0.5 text-xs text-green-700">
                Foods containing your selected allergens are hidden.
              </p>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-[#171717] text-white shadow-md"
                  : "border border-black/5 bg-white text-gray-500 hover:text-gray-900"
              }`}
            >
              {category}
            </button>
          ))}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2.5 text-sm font-medium text-gray-600"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Popular */}
        {!search && activeCategory === "All" && (
          <section className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />

                  <h2 className="text-xl font-bold">Most ordered</h2>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  Popular with diners today
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
              {[...safeFoods]
                .sort((a, b) => b.ordered - a.ordered)
                .slice(0, 3)
                .map((food) => (
                  <div
                    key={food._id}
                    onClick={() => navigate(`/food/${food._id}`)}
                    className="min-w-[270px] overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
                  >
                    <div className="relative">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="h-44 w-full object-cover"
                      />

                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow-sm">
                        <Flame size={13} className="text-orange-500" />
                        {food.ordered} ordered
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold">{food.name}</h3>

                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-semibold">
                          <Star
                            size={13}
                            fill="currentColor"
                            className="text-yellow-500"
                          />
                          {food.rating}
                        </span>

                        <span className="text-gray-400">
                          ({food.reviews} reviews)
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-bold">₹{food.price}</span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(food);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* All foods */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {activeCategory === "All" ? "Explore our menu" : activeCategory}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {filteredFoods.length} dishes available
              </p>
            </div>
          </div>

          {filteredFoods.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Search size={22} />
              </div>

              <h3 className="mt-4 font-semibold">No dishes found</h3>

              <p className="mt-1 text-sm text-gray-400">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food._id}
                  food={food}
                  onAdd={() => addToCart(food)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 left-5 right-5 z-40 sm:left-auto sm:right-8 sm:w-96">
          <button
            onClick={() => navigate("/cart")}
            className="flex w-full items-center justify-between rounded-2xl bg-[#171717] px-5 py-4 text-white shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingBag size={18} />
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>

                <p className="text-xs text-white/50">Ready to order</p>
              </div>
            </div>

            <span className="font-semibold">View Cart →</span>
          </button>
        </div>
      )}
    </div>
  );
};

const FoodCard = ({ food, onAdd }) => {
  const navigate = useNavigate();
  return (
    <article
      onClick={() => navigate(`/food/${food._id}`)}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Rating */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow-sm">
          <Star size={13} fill="currentColor" className="text-yellow-500" />
          {food.rating}
        </div>

        {/* Ordered */}
        {food.ordered >= 200 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#171717]/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Flame size={13} className="text-orange-400" />
            Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">{food.name}</h3>

            <p className="mt-1 text-xs text-gray-400">{food.category}</p>
          </div>

          <span className="font-bold">₹{food.price}</span>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star size={13} fill="currentColor" className="text-yellow-500" />
            {food.rating}
          </span>

          <span>{food.reviews} reviews</span>

          <span className="flex items-center gap-1">
            <Flame size={13} className="text-orange-500" />
            {food.ordered} ordered
          </span>
        </div>

        {/* Ingredients */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {food.ingredients.slice(0, 3).map((ingredient) => (
            <span
              key={ingredient}
              className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium capitalize text-gray-500"
            >
              {ingredient}
            </span>
          ))}

          {food.ingredients.length > 3 && (
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-400">
              +{food.ingredients.length - 3}
            </span>
          )}
        </div>

        {/* Add */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
        >
          <Plus size={17} />
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default Menu;
