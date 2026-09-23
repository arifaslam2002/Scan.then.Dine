import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Utensils } from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";
const ActiveOrder = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parcelOrder, setParcelOrder] = useState(null);
  const orderType = localStorage.getItem("orderType") || "dine-in";
  const isParcel = orderType === "parcel";

  useEffect(() => {
    const orderType = localStorage.getItem("orderType") || "dine-in";
    const isParcel = orderType === "parcel";
    const savedOrderId = localStorage.getItem("activeOrderId");
    const savedSessionId = localStorage.getItem("sessionId");

    const fetchData = async () => {
      try {
        if (isParcel) {
          if (!savedOrderId) {
            setError("Parcel order not found.");
            setLoading(false);
            return;
          }

          const response = await api.get(`/orders/${savedOrderId}`);

          setParcelOrder(response.data);
          setOrders([response.data]);
        } else {
          if (!savedSessionId) {
            setError("Dining session not found.");
            setLoading(false);
            return;
          }

          const response = await api.get(`/dining-sessions/${savedSessionId}`);

          setSession(response.data.session);
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch active order:", error);

        setError(error.response?.data?.message || "Failed to load your order.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );

      setParcelOrder((prevOrder) =>
        prevOrder?._id === updatedOrder._id ? updatedOrder : prevOrder,
      );
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);

    return () => {
      clearInterval(interval);
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
    };
  }, []);

  const getItemPrice = (item) => {
    const addonsTotal = (item.addons || []).reduce(
      (total, addon) => total + Number(addon.price || 0),
      0,
    );

    return Number(item.price) + addonsTotal;
  };

  const getOrderTotal = (order) => {
    if (!order?.items) return 0;

    return order.items.reduce(
      (total, item) => total + getItemPrice(item) * item.quantity,
      0,
    );
  };
  const sessionTotal = orders.reduce(
    (total, order) => total + getOrderTotal(order),
    0,
  );
  const getStatusText = (status) => {
    const statusMap = {
      pending: "Order received",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready",
      served: "Served",
      cancelled: "Cancelled",
    };

    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <p className="text-sm text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Unable to load orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-5 py-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => navigate("/menu")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500"
        >
          <ArrowLeft size={18} />
          Menu
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Utensils size={23} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {isParcel ? "Order Type" : "Dining Session"}
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              {isParcel ? "Parcel / Takeaway" : session?.tableNumber}
            </h1>
          </div>
        </div>

        {!isParcel && session && (
          <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <p className="text-sm font-semibold text-orange-800">
              {session.guestCount}{" "}
              {session.guestCount === 1 ? "Guest" : "Guests"}
            </p>

            <p className="mt-1 text-xs text-orange-600">
              Your orders are linked to this dining session.
            </p>
          </div>
        )}

        <div className="mt-7">
          <h2 className="text-lg font-bold text-gray-900">Your Orders</h2>

          <div className="mt-4 space-y-4">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Order #{index + 1}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item, itemIndex) => (
                    <div
                      key={`${order._id}-${itemIndex}`}
                      className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.name} × {item.quantity}
                          </p>

                          {item.addons?.length > 0 && (
                            <div className="mt-1">
                              {item.addons.map((addon) => (
                                <p
                                  key={addon.name}
                                  className="text-xs text-gray-400"
                                >
                                  + {addon.name} · ₹{addon.price}
                                </p>
                              ))}
                            </div>
                          )}

                          {item.note && (
                            <p className="mt-1 text-xs text-orange-600">
                              Note: {item.note}
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          ₹{getItemPrice(item) * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-medium text-gray-500">
                    Order Total
                  </span>

                  <span className="font-bold text-gray-900">
                    ₹{getOrderTotal(order)}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Track Order
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-3xl bg-gray-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">
                {isParcel ? "Order Total" : "Current Bill"}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {isParcel
                  ? "Your parcel order"
                  : `${orders.length} ${
                      orders.length === 1 ? "Order" : "Orders"
                    } in this session`}
              </p>
            </div>

            <p className="text-2xl font-bold">₹{sessionTotal}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/menu")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-semibold text-white transition hover:bg-orange-600"
        >
          <Plus size={20} />
          Order More
        </button>

        <button
          onClick={() => navigate("/bill")}
          className="mt-3 w-full rounded-2xl border border-orange-200 bg-white px-5 py-4 font-semibold text-orange-600 transition hover:bg-orange-50"
        >
          Get Bill
        </button>

        {!isParcel && (
          <button
            onClick={() => navigate("/finish-dining")}
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Finished Eating
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveOrder;
