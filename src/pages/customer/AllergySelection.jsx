import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  CircleCheck,
  Egg,
  Fish,
  Leaf,
  Milk,
  Nut,
  Wheat,
} from "lucide-react";

const allergies = [
  {
    id: "peanuts",
    name: "Peanuts",
    icon: Nut,
  },
  {
    id: "tree-nuts",
    name: "Tree Nuts",
    icon: Nut,
  },
  {
    id: "dairy",
    name: "Milk / Dairy",
    icon: Milk,
  },
  {
    id: "egg",
    name: "Egg",
    icon: Egg,
  },
  {
    id: "fish",
    name: "Fish",
    icon: Fish,
  },
  {
    id: "shellfish",
    name: "Shellfish",
    icon: Fish,
  },
  {
    id: "soy",
    name: "Soy",
    icon: Leaf,
  },
  {
    id: "gluten",
    name: "Gluten",
    icon: Wheat,
  },
  {
    id: "sesame",
    name: "Sesame",
    icon: Leaf,
  },
];

const AllergySelection = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [noAllergies, setNoAllergies] = useState(false);

  const handleToggle = (id) => {
    setNoAllergies(false);

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleNoAllergies = () => {
    setSelected([]);
    setNoAllergies(true);
  };

  const handleContinue = () => {
    localStorage.setItem(
      "customerAllergies",
      JSON.stringify(selected)
    );

    localStorage.setItem(
      "noAllergies",
      JSON.stringify(noAllergies)
    );

    navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">

      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">

          <button
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-base font-bold tracking-tight">
            Scan<span className="text-orange-500">.</span>
            Then<span className="text-orange-500">.</span>
            Dine
          </div>

          <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
            Table T-05
          </div>

        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-5xl px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-3">

          <div className="h-1.5 flex-1 rounded-full bg-orange-500" />

          <div className="h-1.5 flex-1 rounded-full bg-gray-200" />

          <div className="h-1.5 flex-1 rounded-full bg-gray-200" />

        </div>

        <div className="mt-2 flex justify-between text-[11px] font-medium text-gray-400">
          <span>Preferences</span>
          <span>Menu</span>
          <span>Order</span>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-5 pb-32 pt-10 sm:px-8">

        {/* Heading */}
        <div className="text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <ShieldIcon />
          </div>

          <p className="text-sm font-semibold text-orange-500">
            Step 1 of 3
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Any food allergies?
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
            Tell us what you need to avoid. We'll use this information
            to hide foods containing those ingredients from your menu.
          </p>

        </div>

        {/* Allergy Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">

          {allergies.map((allergy) => {
            const Icon = allergy.icon;
            const isSelected = selected.includes(allergy.id);

            return (
              <button
                key={allergy.id}
                type="button"
                onClick={() => handleToggle(allergy.id)}
                className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-black/5 bg-white hover:-translate-y-0.5 hover:border-black/10 hover:shadow-md"
                }`}
              >

                {/* Check */}
                <div
                  className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full transition ${
                    isSelected
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-transparent"
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </div>

                {/* Icon */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? "bg-white text-orange-500"
                      : "bg-gray-50 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500"
                  }`}
                >
                  <Icon size={21} />
                </div>

                <p className="mt-4 text-sm font-semibold">
                  {allergy.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Avoid this ingredient
                </p>

              </button>
            );
          })}

        </div>

        {/* No Allergies */}
        <button
          type="button"
          onClick={handleNoAllergies}
          className={`mt-4 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
            noAllergies
              ? "border-green-500 bg-green-50"
              : "border-black/5 bg-white hover:border-black/10 hover:shadow-sm"
          }`}
        >

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              noAllergies
                ? "bg-green-500 text-white"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            <CircleCheck size={21} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold">
              I don't have any allergies
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Show me the complete menu
            </p>
          </div>

          {noAllergies && (
            <Check
              size={20}
              className="text-green-600"
              strokeWidth={3}
            />
          )}

        </button>

        {/* Safety Notice */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">

          <div className="shrink-0 text-amber-600">
            <AlertTriangle size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Important allergy information
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800/80">
              Ingredients and preparation methods may vary. If you have
              a serious allergy, please confirm with restaurant staff
              before ordering.
            </p>
          </div>

        </div>

      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/5 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-4">

          <div className="hidden flex-1 sm:block">
            <p className="text-sm font-semibold">
              {noAllergies
                ? "No allergies selected"
                : selected.length === 0
                  ? "No allergies selected"
                  : `${selected.length} ${selected.length === 1 ? "allergy" : "allergies"} selected`}
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              You can change this later
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-black sm:w-auto"
          >
            Continue to Menu

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-1">
              <ArrowRight size={15} />
            </span>
          </button>

        </div>
      </div>

    </div>
  );
};

const ShieldIcon = () => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default AllergySelection;