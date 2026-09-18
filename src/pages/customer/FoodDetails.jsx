import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  AlertTriangle,
} from "lucide-react";

const foods = [
  {
    id: 1,
    name: "Chicken Alfaham",
    category: "Grills",
    price: 280,
    rating: 4.8,
    reviews: 42,
    ordered: 156,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1200&q=80",
    description:
      "Juicy charcoal-grilled chicken marinated with aromatic spices, garlic and fresh lemon. Served hot with a smoky grilled flavor.",
    ingredients: [
      "Chicken",
      "Spices",
      "Garlic",
      "Lemon",
    ],
  },
  {
    id: 2,
    name: "Chicken Burger",
    category: "Burgers",
    price: 220,
    rating: 4.7,
    reviews: 86,
    ordered: 243,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    description:
      "Crispy chicken fillet layered with fresh lettuce, cheese and our signature sauce inside a soft toasted bun.",
    ingredients: [
      "Chicken",
      "Wheat",
      "Egg",
      "Milk",
      "Cheese",
      "Lettuce",
    ],
  },
  {
    id: 3,
    name: "Chicken Fried Rice",
    category: "Rice",
    price: 190,
    rating: 4.6,
    reviews: 64,
    ordered: 198,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80",
    description:
      "Fragrant rice wok-tossed with tender chicken, vegetables, egg and a flavorful soy-based seasoning.",
    ingredients: [
      "Rice",
      "Chicken",
      "Egg",
      "Soy",
      "Vegetables",
    ],
  },
  {
    id: 4,
    name: "Tandoori Chicken",
    category: "Grills",
    price: 320,
    rating: 4.9,
    reviews: 108,
    ordered: 287,
    image:
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80",
    description:
      "Classic tandoori chicken marinated in yogurt and aromatic spices, then roasted for a delicious smoky finish.",
    ingredients: [
      "Chicken",
      "Yogurt",
      "Spices",
      "Lemon",
    ],
  },
  {
    id: 5,
    name: "Paneer Butter Masala",
    category: "Curries",
    price: 240,
    rating: 4.7,
    reviews: 51,
    ordered: 132,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
    description:
      "Soft paneer cooked in a rich tomato and butter gravy with aromatic Indian spices.",
    ingredients: [
      "Paneer",
      "Milk",
      "Butter",
      "Tomato",
      "Cashew",
    ],
  },
  {
    id: 6,
    name: "Chocolate Milkshake",
    category: "Drinks",
    price: 150,
    rating: 4.8,
    reviews: 73,
    ordered: 221,
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80",
    description:
      "Creamy chocolate milkshake blended with rich chocolate and chilled milk.",
    ingredients: [
      "Milk",
      "Chocolate",
      "Sugar",
    ],
  },
];

const allergyMap = {
  peanuts: ["peanut", "peanuts"],
  "tree-nuts": [
    "almond",
    "cashew",
    "pistachio",
    "walnut",
    "nuts",
  ],
  dairy: [
    "milk",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "paneer",
  ],
  egg: ["egg"],
  fish: ["fish"],
  shellfish: [
    "shellfish",
    "shrimp",
    "prawn",
    "crab",
  ],
  soy: ["soy", "soya"],
  gluten: ["wheat", "flour", "bread"],
  sesame: ["sesame"],
};

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);

  const food = foods.find(
    (item) => item.id === Number(id)
  );

  const allergies = useMemo(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("customerAllergies")
        ) || []
      );
    } catch {
      return [];
    }
  }, []);

  if (!food) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Food not found
          </h1>

          <button
            onClick={() => navigate("/menu")}
            className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const restrictedIngredients = allergies.flatMap(
    (allergy) => allergyMap[allergy] || []
  );

  const matchedAllergens = food.ingredients.filter(
    (ingredient) =>
      restrictedIngredients.includes(
        ingredient.toLowerCase()
      )
  );

  const isUnsafe = matchedAllergens.length > 0;

  const total = food.price * quantity;

  const addToCart = () => {
    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingItem = existingCart.find(
      (item) => item.id === food.id
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = existingCart.map((item) =>
        item.id === food.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...food,
          quantity,
        },
      ];
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">

          <button
            onClick={() => navigate("/menu")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="text-base font-bold">
            Scan
            <span className="text-orange-500">.</span>
            Then
            <span className="text-orange-500">.</span>
            Dine
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <ShoppingBag size={18} />
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-32 pt-6 sm:px-8">

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">

          {/* Image */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm">

            <img
              src={food.image}
              alt={food.name}
              className="h-[380px] w-full rounded-[1.5rem] object-cover sm:h-[500px]"
            />

            {/* Popular badge */}
            {food.ordered >= 200 && (
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold shadow-lg backdrop-blur">
                <Flame
                  size={14}
                  className="text-orange-500"
                />
                Most Ordered
              </div>
            )}

          </div>

          {/* Details */}
          <div className="pt-2">

            {/* Category */}
            <p className="text-sm font-semibold text-orange-500">
              {food.category}
            </p>

            <div className="mt-2 flex items-start justify-between gap-5">

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {food.name}
              </h1>

              <span className="shrink-0 text-xl font-bold">
                ₹{food.price}
              </span>

            </div>

            {/* Rating */}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-bold text-yellow-700">
                <Star
                  size={15}
                  fill="currentColor"
                />
                {food.rating}
              </div>

              <span className="text-sm text-gray-400">
                {food.reviews} reviews
              </span>

              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Flame
                  size={15}
                  className="text-orange-500"
                />
                {food.ordered} ordered
              </span>

            </div>

            {/* Description */}
            <p className="mt-7 text-sm leading-7 text-gray-500 sm:text-base">
              {food.description}
            </p>

            {/* Ingredients */}
            <div className="mt-8">

              <h2 className="text-sm font-bold">
                Ingredients
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">

                {food.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className={`rounded-full px-3 py-2 text-xs font-medium ${
                      matchedAllergens.includes(
                        ingredient
                      )
                        ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                        : "bg-white text-gray-600 ring-1 ring-black/5"
                    }`}
                  >
                    {ingredient}

                    {matchedAllergens.includes(
                      ingredient
                    ) && " ⚠️"}
                  </span>
                ))}

              </div>

            </div>

            {/* Allergy warning */}
            {isUnsafe ? (
              <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-4">

                <div className="flex gap-3">

                  <AlertTriangle
                    size={20}
                    className="shrink-0 text-red-500"
                  />

                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Not suitable for your allergy preferences
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      This dish contains:{" "}
                      <strong>
                        {matchedAllergens.join(", ")}
                      </strong>
                      .
                    </p>
                  </div>

                </div>

              </div>
            ) : (
              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

                <ShieldCheck
                  size={20}
                  className="text-green-600"
                />

                <div>
                  <p className="text-sm font-bold text-green-800">
                    No selected allergens detected
                  </p>

                  <p className="mt-1 text-xs text-green-700">
                    Based on the ingredients provided by the restaurant.
                  </p>
                </div>

              </div>
            )}

            {/* Quantity */}
            {!isUnsafe && (
              <div className="mt-8 flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4">

                <div>
                  <p className="text-sm font-semibold">
                    Quantity
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    ₹{food.price} each
                  </p>
                </div>

                <div className="flex items-center gap-4">

                  <button
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.max(1, prev - 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
                  >
                    <Minus size={17} />
                  </button>

                  <span className="w-5 text-center font-bold">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((prev) => prev + 1)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
                  >
                    <Plus size={17} />
                  </button>

                </div>

              </div>
            )}

            {/* Add button */}
            <button
              disabled={isUnsafe}
              onClick={addToCart}
              className={`mt-4 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold transition ${
                isUnsafe
                  ? "cursor-not-allowed bg-gray-200 text-gray-400"
                  : "bg-[#171717] text-white shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:bg-orange-500"
              }`}
            >
              <ShoppingBag size={18} />

              {isUnsafe
                ? "Unavailable for Your Preferences"
                : `Add to Cart · ₹${total}`}
            </button>

            {/* Safety note */}
            <p className="mt-4 text-center text-[11px] leading-5 text-gray-400">
              Allergy information is provided by the restaurant.
              If you have a serious allergy, please confirm with
              restaurant staff before ordering.
            </p>

          </div>

        </div>

      </main>
    </div>
  );
};

export default FoodDetails;