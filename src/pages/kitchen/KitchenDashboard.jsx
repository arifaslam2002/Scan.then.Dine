import api from "../../services/api";
import { useEffect, useState } from "react";
import socket from "../../services/socket";
import LogoutButton from "../../components/LogoutButton";
const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const filteredOrders =
    activeStatus === "all"
      ? orders
      : orders.filter((order) => order.status === activeStatus);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders")

        setOrders(response.data);
        setError("");
      } catch (error) {
        console.error(error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    // Existing order status event
    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) => {
        const orderExists = prevOrders.some(
          (order) => order._id === updatedOrder._id,
        );

        if (orderExists) {
          return prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          );
        }

        return [updatedOrder, ...prevOrders];
      });
    };

    // New order event
    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);

    socket.on("newOrder", handleNewOrder);

    return () => {
      clearInterval(interval);

      socket.off("orderStatusUpdated", handleOrderStatusUpdate);

      socket.off("newOrder", handleNewOrder);
    };
  }, []);
  const updateStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status })

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? response.data.order : order,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update order status");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-orange-500">Scan.Then.Dine</p>

          <h1 className="mt-1 text-3xl font-bold text-[#171717]">
            Kitchen Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage incoming restaurant orders.
          </p>
          <LogoutButton />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {["all", "pending", "confirmed", "preparing", "ready", "served"].map(
            (status) => {
              const count =
                status === "all"
                  ? orders.length
                  : orders.filter((order) => order.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeStatus === status
                      ? "bg-orange-500 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeStatus === status
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Order</p>

                    <h2 className="font-bold text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </h2>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                    {order.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Customer:</span>{" "}
                    {order.customerName}
                  </p>

                  <p>
                    <span className="font-medium">Table:</span>{" "}
                    {order.tableNumber}
                  </p>

                  <p>
                    <span className="font-medium">Phone:</span> {order.phone}
                  </p>
                </div>

                <div className="my-5 border-t border-gray-100" />

                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="font-semibold text-gray-700">Total</span>

                  <span className="text-lg font-bold text-orange-500">
                    ₹{order.totalAmount}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateStatus(order._id, "confirmed")}
                      className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      Confirm Order
                    </button>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(order._id, "preparing")}
                      className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Start Preparing
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() => updateStatus(order._id, "ready")}
                      className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                    >
                      Mark Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      onClick={() => updateStatus(order._id, "served")}
                      className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
                    >
                      Mark Served
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
