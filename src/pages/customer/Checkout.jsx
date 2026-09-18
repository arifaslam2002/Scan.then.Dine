import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button
          onClick={() => navigate("/cart")}
          className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <p className="mt-2 text-sm text-gray-500">
          Confirm your details before placing the order.
        </p>

        {/* Customer Details */}
        <div className="mt-8 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer Details
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
              />
            </div>
          </div>
        </div>
        {/* Order Items */}
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>

          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-bold text-gray-900">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="my-5 h-px bg-gray-100" />

          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>

            <span className="text-xl font-bold text-orange-500">
              ₹{subtotal}
            </span>
          </div>
        </div>
        {/* Table Information */}
        <div className="mt-6 rounded-3xl border border-orange-100 bg-orange-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
            Dining Table
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Table T-05</h2>

              <p className="mt-1 text-sm text-gray-500">
                Your order will be served at this table.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              🍽️
            </div>
          </div>
        </div>
        {/* Payment Method */}
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Method
          </h2>

          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <input
                type="radio"
                name="payment"
                value="counter"
                defaultChecked
                className="accent-orange-500"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Pay at Counter
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Place your order now and pay at the restaurant counter.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-orange-200">
              <input
                type="radio"
                name="payment"
                value="online"
                className="accent-orange-500"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Online Payment
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Pay securely online.
                </p>
              </div>
            </label>
          </div>
        </div>
        {/* Place Order */}
        <button
          onClick={() => {
            if (!customerName.trim()) {
              alert("Please enter your name");
              return;
            }

            if (!phone.trim()) {
              alert("Please enter your phone number");
              return;
            }

            if (cart.length === 0) {
              alert("Your cart is empty");
              return;
            }

            alert("Order confirmation will be connected next!");
          }}
          className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99]"
        >
          Place Order • ₹{subtotal}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
