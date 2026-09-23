import { useState } from "react";
import api from "../../services/api";

const AddFoodForm = ({ onFoodAdded }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Grills");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [addons, setAddons] = useState([]);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const handleAddAddon = () => {
    if (!addonName.trim() || !addonPrice) {
      alert("Please enter add-on name and price");
      return;
    }

    setAddons((prev) => [
      ...prev,
      {
        name: addonName.trim(),
        price: Number(addonPrice),
      },
    ]);

    setAddonName("");
    setAddonPrice("");
  };

  const handleRemoveAddon = (index) => {
    setAddons((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !description.trim() || !image) {
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
      formData.append("addons", JSON.stringify(addons));
      formData.append("image", image);

      const response = await api.post("/foods", formData);

      onFoodAdded(response.data.food);

      setName("");
      setCategory("Grills");
      setPrice("");
      setDescription("");
      setIngredients("");
      setAddons([]);
      setAddonName("");
      setAddonPrice("");
      setImage(null);
      setImagePreview("");

      alert("Food added successfully");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to add food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bg-white border m-10 border-gray-200 rounded-3xl p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Food Details</h2>

        <p className="text-xs text-gray-500 mt-1">
          Add the details for this menu item.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Food Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Food Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chicken Shawarma"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Price
          </label>

          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="180"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              } else {
                setImagePreview("");
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          />

          {imagePreview && (
            <div className="mt-2 relative">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-28 object-cover rounded-xl border border-gray-200"
              />

              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview("");
                }}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs hover:bg-black transition"
              >
                Remove
              </button>
            </div>
          )}

          {image && (
            <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>

          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the food..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ingredients
          </label>

          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Chicken, Garlic, Lemon, Spices"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
          />

          <p className="text-xs text-gray-500 mt-1.5">
            Separate ingredients with commas.
          </p>
        </div>
        {/* Add-ons */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Add-ons
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
              placeholder="Extra Cheese"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
            />

            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={addonPrice}
                onChange={(e) => setAddonPrice(e.target.value)}
                placeholder="30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
              />

              <button
                type="button"
                onClick={handleAddAddon}
                className="px-4 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                Add
              </button>
            </div>
          </div>

          {addons.length > 0 && (
            <div className="mt-3 space-y-2">
              {addons.map((addon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {addon.name}
                    </p>

                    <p className="text-xs text-gray-500">₹{addon.price}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(index)}
                    className="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Button */}
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Adding Food..." : "Add Food"}
        </button>
      </div>
    </form>
  );
};

export default AddFoodForm;
