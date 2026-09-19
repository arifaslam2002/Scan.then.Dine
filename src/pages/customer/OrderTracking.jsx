import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrderTracking = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/orders/${id}`,
        );

        setOrder(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

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
            <p className="text-sm text-gray-500">Order</p>

            <p className="mt-1 font-bold text-gray-900">
              #{order._id.slice(-6).toUpperCase()}
            </p>

            <p className="mt-4 text-sm text-gray-500">Current Status</p>

            <p className="mt-1 text-xl font-bold capitalize text-orange-500">
              {order.status}
            </p>
          </div>

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
