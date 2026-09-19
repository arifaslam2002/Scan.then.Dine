import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5] p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Order not found</h1>

          <button
            onClick={() => navigate("/menu")}
            className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <CheckCircle size={64} className="mx-auto text-green-500" />

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Order Confirmed!
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Your order has been sent to the kitchen.
          </p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Order ID</span>

              <span className="text-sm font-semibold">
                #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-sm text-gray-500">Table</span>

              <span className="text-sm font-semibold">{order.tableNumber}</span>
            </div>
          </div>

          <div className="mt-6 text-left">
            <h2 className="font-semibold text-gray-900">Your Items</h2>

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
          <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
              Order Status
            </p>

            <p className="mt-1 text-lg font-bold capitalize text-gray-900">
              {order.status}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              The kitchen will update your order as it is prepared.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate(`/order/${order._id}`)}
              className="w-full rounded-2xl bg-orange-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Track Your Order
            </button>

            <button
              onClick={() => navigate("/menu")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Home size={18} />
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
