import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock, ChefHat, PackageCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";
const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);

        setOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Fallback: check the order every 10 seconds
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);

    // Real-time status update
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Order not found.</p>
      </div>
    );
  }

  const statuses = [
    {
      key: "pending",
      label: "Order Placed",
      icon: Clock,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: Check,
    },
    {
      key: "preparing",
      label: "Preparing",
      icon: ChefHat,
    },
    {
      key: "ready",
      label: "Ready",
      icon: PackageCheck,
    },
    {
      key: "served",
      label: "Served",
      icon: Check,
    },
  ];

  const currentIndex = statuses.findIndex((item) => item.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
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
            <h1 className="text-xl font-bold text-gray-900">Track Order</h1>

            <p className="text-sm text-gray-500">
              Order #{order._id.slice(-6)}
            </p>
          </div>
        </div>

        {/* Current status */}
        <div className="mb-6 rounded-3xl bg-gray-900 p-6 text-white">
          <p className="text-sm text-gray-400">Current Status</p>

          <h2 className="mt-1 text-2xl font-bold capitalize">{order.status}</h2>
        </div>

        {/* Timeline */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Order Progress
          </h2>

          <div className="space-y-6">
            {statuses.map((status, index) => {
              const Icon = status.icon;
              const completed = index <= currentIndex;

              return (
                <div key={status.key} className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      completed
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p
                      className={`font-semibold ${
                        completed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {status.label}
                    </p>

                    {index === currentIndex && (
                      <p className="mt-1 text-sm text-orange-500">
                        Current status
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order items */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Your Order</h2>

          <div className="space-y-4">
            {order.items.map((item, index) => {
              const addonsTotal = (item.addons || []).reduce(
                (total, addon) => total + Number(addon.price || 0),
                0,
              );

              const itemTotal =
                (Number(item.price) + addonsTotal) * item.quantity;

              return (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>

                    <p className="text-sm text-gray-500">× {item.quantity}</p>
                  </div>

                  <p className="font-semibold text-gray-900">₹{itemTotal}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Total</span>

              <span className="text-lg font-bold text-gray-900">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
