import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
const Checkout = () => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(
    localStorage.getItem("customerName") || "",
  );

  const [phone, setPhone] = useState(
    localStorage.getItem("customerPhone") || "",
  );
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    const savedTableNumber = localStorage.getItem("tableNumber") || "T-05";

    setTableNumber(savedTableNumber);
  }, []);
  const getItemPrice = (item) => {
    const addonsTotal = (item.addons || []).reduce(
      (total, addon) => total + addon.price,
      0,
    );

    return item.price + addonsTotal;
  };

  const subtotal = cart.reduce(
    (total, item) => total + getItemPrice(item) * item.quantity,
    0,
  );
  const orderType = localStorage.getItem("orderType") || "dine-in";
  const guestCount = Number(localStorage.getItem("guestCount") || 0);
  const sessionId = localStorage.getItem("sessionId") || null;
  const isParcel = orderType === "parcel";
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

            {customerName && phone && (
              <p className="text-xs text-gray-400">
                Your details are saved for this dining session.
              </p>
            )}
          </div>
        </div>
        {/* Order Items */}
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>

          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId} className="flex items-start gap-3">
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

                  {item.addons?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.addons.map((addon) => (
                        <div
                          key={addon.name}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <span>+ {addon.name}</span>
                          <span>₹{addon.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.note && (
                    <div className="mt-2 rounded-xl bg-orange-50 px-3 py-2">
                      <p className="text-[11px] font-semibold text-orange-700">
                        Note
                      </p>

                      <p className="mt-0.5 text-xs text-orange-600">
                        {item.note}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm font-bold text-gray-900">
                  ₹{getItemPrice(item) * item.quantity}
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
        {/* Order Type Information */}
        <div
          className={`mt-6 rounded-3xl border p-5 ${
            isParcel
              ? "border-blue-100 bg-blue-50"
              : "border-orange-100 bg-orange-50"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              isParcel ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {isParcel ? "Ordering Type" : "Dining Table"}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isParcel ? "Parcel / Takeaway" : tableNumber}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isParcel
                  ? "Your order will be prepared as a parcel for pickup."
                  : "Your order will be served at this table."}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              {isParcel ? "🥡" : "🍽️"}
            </div>
          </div>
        </div>
        {/* Place Order */}
        <button
          onClick={async () => {
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

            try {
              const orderType = localStorage.getItem("orderType") || "dine-in";
              localStorage.setItem("customerName", customerName.trim());
              localStorage.setItem("customerPhone", phone.trim());
              const activeOrderId = localStorage.getItem("activeOrderId");
              const response = await api.post("/orders", {
                orderType,
                customerName,
                phone,
                tableNumber: orderType === "dine-in" ? tableNumber : null,
                guestCount: orderType === "dine-in" ? guestCount : null,
                sessionId: orderType === "dine-in" ? sessionId : null,
                items: cart.map((item) => ({
                  foodId: item._id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  addons: item.addons || [],
                  note: item.note || "",
                })),

                totalAmount: subtotal,
                paymentMethod: "cash",
              });

              console.log(response.data);

              localStorage.removeItem("cart");
              localStorage.setItem("activeOrderId", response.data.order._id);
              navigate("/order-confirmation", {
                state: {
                  order: response.data.order,
                },
              });
            } catch (error) {
              console.error(error);

              alert("Failed to place order");
            }
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
