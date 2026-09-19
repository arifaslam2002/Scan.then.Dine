import { useState } from "react";
import axios from "axios";

const EditFoodForm = ({ food, onFoodUpdated, onCancel }) => {
  const [name, setName] = useState(food.name);
  const [category, setCategory] = useState(food.category);
  const [price, setPrice] = useState(food.price);
  const [description, setDescription] = useState(food.description);
  const [ingredients, setIngredients] = useState(food.ingredients.join(", "));

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(food.image);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !description.trim()) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

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

      const response = await axios.patch(
        `http://localhost:3000/api/foods/${food._id}`,
        formData,
      );

      onFoodUpdated(response.data.food);

      alert("Food updated successfully");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to update food");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-5">Edit Food</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Food Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Food Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
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
          <label className="block text-sm font-medium mb-2">Price</label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Food Image</label>

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
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
          />

          {imagePreview && (
            <div className="mt-3 relative">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-48 object-cover rounded-2xl"
              />

              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(food.image);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Description</label>

          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
          />
        </div>

        {/* Ingredients */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Ingredients</label>

          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
            placeholder="Chicken, Garlic, Lemon"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditFoodForm;
