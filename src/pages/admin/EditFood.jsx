import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EditFoodForm from "../admin/EditFoodForm";

const EditFood = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleFoodUpdated = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Admin Dashboard
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                Edit Food
              </h1>
            </div>

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

      {/* Form */}
      <main className="max-w-5xl mx-auto px-6 py-6">

        <EditFoodForm
          foodId={id}
          onFoodUpdated={handleFoodUpdated}
          onCancel={() => navigate("/admin")}
        />

      </main>

    </div>
  );
};

export default EditFood;