import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ChefHat,
  Utensils,
  Table2,
  QrCode,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import LogoutButton from "../../components/LogoutButton";
import api from "../../services/api";
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState([]);
  const [foodSearch, setFoodSearch] = useState("");
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");

        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data.orders || [],
        );
        const foodResponse = await api.get("/foods");

        setFoods(Array.isArray(foodResponse.data) ? foodResponse.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    const handleOrderStatusUpdate = (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );
    };

    socket.on("newOrder", handleNewOrder);

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);
    return () => {
      clearInterval(interval);

      socket.off("newOrder", handleNewOrder);

      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
    };
  }, []);

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) => !["served", "cancelled"].includes(order.status),
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "served",
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled",
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.totalAmount, 0);
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });

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
  const updateFoodAvailability = async (foodId, available) => {
    try {
      const response = await api.patch(`/foods/${foodId}/availability`, {
        available,
      });

      setFoods((prevFoods) =>
        prevFoods.map((food) =>
          food._id === foodId ? response.data?.food || food : food,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update food availability");
    }
  };
  const deleteFood = async (foodId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this food?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/foods/${foodId}`);

      setFoods((prevFoods) => prevFoods.filter((food) => food._id !== foodId));

      alert("Food deleted successfully");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to delete food");
    }
  };
  const today = new Date().toDateString();

  const todayOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).toDateString() === today &&
      order.status !== "cancelled",
  );

  const todayRevenue = todayOrders.reduce(
    (total, order) => total + order.totalAmount,
    0,
  );
  const statusCounts = {
    pending: orders.filter((order) => order.status === "pending").length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    preparing: orders.filter((order) => order.status === "preparing").length,
    ready: orders.filter((order) => order.status === "ready").length,
    served: orders.filter((order) => order.status === "served").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  };
  const filteredFoods = foods.filter((food) =>
    `${food.name} ${food.category}`
      .toLowerCase()
      .includes(foodSearch.toLowerCase()),
  );
  const activeRevenue = orders
    .filter((order) => !["served", "cancelled"].includes(order.status))
    .reduce((total, order) => total + order.totalAmount, 0);

  const completedRevenue = orders
    .filter((order) => order.status === "served")
    .reduce((total, order) => total + order.totalAmount, 0);

  const cancelledAmount = orders
    .filter((order) => order.status === "cancelled")
    .reduce((total, order) => total + order.totalAmount, 0);
  const totalFoods = foods.length;

  const availableFoods = foods.filter((food) => food.available).length;

  const unavailableFoods = foods.filter((food) => !food.available).length;
  const categoryCounts = foods.reduce((counts, food) => {
    counts[food.category] = (counts[food.category] || 0) + 1;

    return counts;
  }, {});
  const mostOrderedFoods = [...foods]
    .sort((a, b) => b.ordered - a.ordered)
    .slice(0, 5);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] p-6">
      <nav className="mb-8 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Scan.Then.Dine
              </h2>

              <p className="text-xs text-gray-500">Restaurant Management</p>
            </div>

            <LogoutButton />
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 sm:flex-none sm:px-4"
            >
              <LayoutDashboard size={17} />
              Admin
            </Link>

            <Link
              to="/kitchen"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex-none sm:px-4"
            >
              <ChefHat size={17} />
              Kitchen
            </Link>

            <Link
              to="/menu"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex-none sm:px-4"
            >
              <Utensils size={17} />
              Menu
            </Link>

            <Link
              to="/admin/tables"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex-none sm:px-4"
            >
              <Table2 size={17} />
              Tables
            </Link>
            <Link
              to="/admin/parcel-qr"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex-none sm:px-4"
            >
              <QrCode size={17} />
              Parcel QR
            </Link>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-orange-500">Scan.Then.Dine</p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Overview of restaurant orders and sales.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total Orders</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Active Orders</p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {activeOrders}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Completed</p>

            <p className="mt-2 text-3xl font-bold text-green-500">
              {completedOrders}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Revenue</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₹{totalRevenue}
            </p>
          </div>
        </div>
        <div className=" mt-6 rounded-3xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Revenue</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{totalRevenue}
          </p>

          <p className="mt-1 text-xs text-gray-500">Today: ₹{todayRevenue}</p>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Active</p>

              <p className="mt-1 text-xl font-bold">{activeOrders}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Completed</p>

              <p className="mt-1 text-xl font-bold">{completedOrders}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Cancelled</p>

              <p className="mt-1 text-xl font-bold">{cancelledOrders}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest restaurant orders
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order._id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  #{order._id.slice(-6).toUpperCase()}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {order.customerName} • Table {order.tableNumber}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="font-semibold text-gray-900">
                  ₹{order.totalAmount}
                </span>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-orange-600">
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Order Status</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm capitalize text-gray-500">{status}</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Menu Items</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">{totalFoods}</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Available Items</p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {availableFoods}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Unavailable Items</p>

          <p className="mt-2 text-3xl font-bold text-red-500">
            {unavailableFoods}
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Revenue Breakdown</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-sm text-gray-500">Active Revenue</p>

            <p className="mt-1 text-2xl font-bold text-orange-500">
              ₹{activeRevenue}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm text-gray-500">Completed Revenue</p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              ₹{completedRevenue}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-sm text-gray-500">Cancelled Amount</p>

            <p className="mt-1 text-2xl font-bold text-red-500">
              ₹{cancelledAmount}
            </p>
          </div>
        </div>
      </div>
      {/* add new food */}
      <button
        onClick={() => navigate("/admin/foods/new")}
        className="mt-6 px-5 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
      >
        + Add New Food
      </button>
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Menu Overview</h2>

          <p className="mt-1 text-sm text-gray-500">Restaurant food items</p>
          <input
            type="text"
            placeholder="Search food or category..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            className="mt-4 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white sm:max-w-md"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFoods.map((food) => (
            <div
              key={food._id}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <img
                src={food.image}
                alt={food.name}
                className="h-40 w-full rounded-2xl object-cover"
              />

              <div className="mt-3">
                <h3 className="font-semibold text-gray-900">{food.name}</h3>

                <p className="mt-1 text-sm text-gray-500">{food.category}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        food.available ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {food.available ? "Available" : "Unavailable"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {food.available
                        ? "Visible to customers"
                        : "Hidden from customers"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      updateFoodAvailability(food._id, !food.available)
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      food.available
                        ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {food.available ? "Make Unavailable" : "Make Available"}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/foods/edit/${food._id}`)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFood(food._id)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Menu Categories</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">{category}</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">{count}</p>

              <p className="mt-1 text-xs text-gray-400">
                {count === 1 ? "food item" : "food items"}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Most Ordered Foods</h2>

        <p className="mt-1 text-sm text-gray-500">
          Top food items based on order count
        </p>

        <div className="mt-5 space-y-3">
          {mostOrderedFoods.map((food, index) => (
            <div
              key={food._id}
              className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                {index + 1}
              </div>

              <img
                src={food.image}
                alt={food.name}
                className="h-14 w-14 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">
                  {food.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">{food.category}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900">{food.ordered}</p>

                <p className="text-xs text-gray-500">orders</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
