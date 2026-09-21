import { useEffect, useState } from "react";
import api from "../../services/api";

const EditFoodForm = ({ foodId, onFoodUpdated, onCancel }) => {
  const [food, setFood] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Grills");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch food
  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/foods/${foodId}`);

        const fetchedFood = response.data;

        setFood(fetchedFood);

        setName(fetchedFood.name);
        setCategory(fetchedFood.category);
        setPrice(fetchedFood.price);
        setDescription(fetchedFood.description);
        setIngredients(fetchedFood.ingredients.join(", "));

        setImagePreview(fetchedFood.image);
      } catch (error) {
        console.error(error);

        alert("Failed to load food");
        onCancel();
      } finally {
        setLoading(false);
      }
    };

    if (foodId) {
      fetchFood();
    }
  }, [foodId]);

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !description.trim()) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("description", description);

      formData.append(
        "ingredients",
        JSON.stringify(
          ingredients
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );

      if (image) {
        formData.append("image", image);
      }

      const response = await api.patch(`/foods/${foodId}`, formData)

      onFoodUpdated(response.data.food);
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to update food");
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
        <p className="text-gray-500">Loading food...</p>
      </div>
    );
  }

  // Food not found
  if (!food) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
        <p className="text-gray-500">Food not found</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border border-gray-200 rounded-3xl p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Food Details</h2>

        <p className="text-sm text-gray-500 mt-1">
          Update the details for this menu item.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Food Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          >
            <option value="Grills">Grills</option>
            <option value="Burgers">Burgers</option>
            <option value="Rice">Rice</option>
            <option value="Curries">Curries</option>
            <option value="Drinks">Drinks</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>

          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedImage = e.target.files[0];

              setImage(selectedImage);

              if (selectedImage) {
                setImagePreview(URL.createObjectURL(selectedImage));
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
          />

          {imagePreview && (
            <div className="mt-3 relative">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-40 object-cover rounded-2xl border border-gray-200"
              />

              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(food.image);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm hover:bg-black transition"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>

          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Ingredients */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients
          </label>

          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          />

          <p className="text-xs text-gray-500 mt-2">
            Separate ingredients with commas.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditFoodForm;
