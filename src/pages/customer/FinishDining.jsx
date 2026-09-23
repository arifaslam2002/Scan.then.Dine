import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const FinishDining = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");

    if (!sessionId) {
      navigate("/");
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await api.get(`/dining-sessions/${sessionId}`);

        setSession(response.data.session);
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Failed to load dining session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [navigate]);

  const getOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
      const addonsTotal = (item.addons || []).reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0,
      );

      return total + (Number(item.price) + addonsTotal) * Number(item.quantity);
    }, 0);
  };

  const totalAmount = orders.reduce(
    (total, order) => total + getOrderTotal(order),
    0,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your dining session...</p>
      </div>
    );
  }
  const handleContinueToBill = async () => {
    const sessionId = localStorage.getItem("sessionId");

    if (!sessionId) {
      alert("Dining session not found");
      return;
    }

    try {
      const response = await api.patch(`/dining-sessions/${sessionId}/finish`);

      setSession(response.data.session);

      navigate("/bill");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Unable to finish dining");
    }
  };
  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/active-order")}
            className="rounded-full bg-white p-2 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Finish Dining</h1>

            <p className="text-sm text-gray-500">
              Table {session?.tableNumber}
            </p>
          </div>
        </div>

        {/* Confirmation */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={34} className="text-green-500" />
            </div>
          </div>

          <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
            Finished Eating?
          </h2>

          <p className="mt-2 text-center text-sm leading-6 text-gray-500">
            Your orders are ready to be added to the final bill. Once you
            continue, you can choose your payment method.
          </p>

          {/* Bill summary */}
          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Orders</span>

              <span className="font-semibold text-gray-900">
                {orders.length}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="font-semibold text-gray-900">Current Bill</span>

              <span className="text-xl font-bold text-orange-500">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* Continue */}
          <button
            onClick={handleContinueToBill}
            className="mt-6 w-full rounded-2xl bg-orange-500 px-5 py-4 font-semibold text-white transition hover:bg-orange-600"
          >
            Continue to Bill
          </button>

          <button
            onClick={() => navigate("/active-order")}
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Keep Eating
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishDining;
