import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ReviewOrder = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const orderType = localStorage.getItem("orderType");

      try {
        if (orderType === "parcel") {
          const orderId = localStorage.getItem("activeOrderId");

          if (!orderId) {
            setLoading(false);
            return;
          }

          const response = await api.get(`/orders/${orderId}`);

          setOrders([response.data]);
        } else {
          const sessionId = localStorage.getItem("sessionId");

          if (!sessionId) {
            setLoading(false);
            return;
          }

          const response = await api.get(`/dining-sessions/${sessionId}`);

          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleRating = (foodId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [foodId]: rating,
    }));
  };

  const handleComment = (foodId, comment) => {
    setComments((prev) => ({
      ...prev,
      [foodId]: comment,
    }));
  };

  const handleSubmit = async () => {
    const reviews = Object.entries(ratings);
    const customerName = localStorage.getItem("customerName") || "Guest";
    if (reviews.length === 0) {
      alert("Please rate at least one food.");
      return;
    }

    setSubmitting(true);

    try {
      for (const [foodId, rating] of reviews) {
        await api.post("/reviews", {
          foodId,
          userName: customerName,
          rating,
          comment: comments[foodId] || "No comment",
        });
      }

      alert("Thank you for your review!");

      localStorage.removeItem("sessionId");
      localStorage.removeItem("guestCount");
      localStorage.removeItem("tableNumber");
      localStorage.removeItem("orderType");
      localStorage.removeItem("customerAllergies");
      localStorage.removeItem("noAllergies");
      localStorage.removeItem("customerName");
      localStorage.removeItem("customerPhone");
      localStorage.removeItem("activeOrderId");

      navigate("/");
    } catch (error) {
      console.error("Failed to submit review:", error);

      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const foods = [];

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!foods.some((food) => food.foodId === item.foodId)) {
        foods.push({
          foodId: item.foodId,
          name: item.name,
        });
      }
    });
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            How was your food?
          </h1>

          <p className="mt-2 text-gray-500">Share your experience with us.</p>
        </div>

        <div className="mt-8 space-y-5">
          {foods.map((food) => (
            <div
              key={food.foodId}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {food.name}
              </h2>

              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(food.foodId, star)}
                  >
                    <Star
                      size={28}
                      className={
                        star <= (ratings[food.foodId] || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comments[food.foodId] || ""}
                onChange={(e) => handleComment(food.foodId, e.target.value)}
                placeholder="Tell us about your experience..."
                maxLength={300}
                rows={3}
                className="mt-4 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-orange-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default ReviewOrder;
