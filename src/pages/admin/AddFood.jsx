import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AddFoodForm from "../admin/AddFoodForm";

const AddFood = () => {
  const navigate = useNavigate();

  const handleFoodAdded = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            {/* Title */}
            <div>
              <p className="text-sm text-gray-500">
                Admin Dashboard
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                Add New Food
              </h1>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>

          </div>

        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">

        <AddFoodForm
          onFoodAdded={handleFoodAdded}
        />

      </main>

    </div>
  );
};

export default AddFood;