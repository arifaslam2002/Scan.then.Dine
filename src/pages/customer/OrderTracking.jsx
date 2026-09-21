import api from "../../services/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../services/socket";
const OrderTracking = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);

        setOrder(response.data);
        setError("");
      } catch (error) {
        console.error(error);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    const handleOrderStatusUpdate = (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
      }
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);

    return () => {
      clearInterval(interval);

      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
    };
  }, [id]);
  const cancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.patch(`/orders/${id}/cancel`);

      setOrder(response.data.order);
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading order...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-orange-500">Scan.Then.Dine</p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Track Your Order
          </h1>

          <div className="mt-6 rounded-2xl bg-orange-50 p-5">
            {order.status === "cancelled" ? (
              <div>
                <p className="text-sm font-semibold text-red-600">
                  Order Cancelled
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This order has been cancelled and will not be prepared.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900">
                  Order Progress
                </p>

                {["pending", "confirmed", "preparing", "ready", "served"].map(
                  (status, index) => {
                    const statuses = [
                      "pending",
                      "confirmed",
                      "preparing",
                      "ready",
                      "served",
                    ];

                    const currentIndex = statuses.indexOf(order.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={status} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                              isCompleted
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </div>

                          {index < statuses.length - 1 && (
                            <div
                              className={`h-8 w-0.5 ${
                                index < currentIndex
                                  ? "bg-orange-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1">
                          <p
                            className={`text-sm font-semibold ${
                              isCurrent
                                ? "text-orange-500"
                                : isCompleted
                                  ? "text-gray-900"
                                  : "text-gray-400"
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </p>

                          {isCurrent && (
                            <p className="mt-1 text-xs text-gray-500">
                              Your order is currently {status}.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </>
            )}
          </div>
          {order.status === "pending" && (
            <button
              onClick={cancelOrder}
              className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Cancel Order
            </button>
          )}
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900">Order Items</h2>

            <div className="mt-3 space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-between border-t border-gray-200 pt-4">
            <span className="font-semibold">Total</span>

            <span className="text-lg font-bold text-orange-500">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
