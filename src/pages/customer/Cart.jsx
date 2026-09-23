import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

    const updatedCart = savedCart.map((item) => ({
      ...item,
      cartItemId:
        item.cartItemId || `${item._id}-${Date.now()}-${Math.random()}`,
    }));

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  }, []);
  const updateQuantity = (cartItemId, change) => {
    const updatedCart = cart
      .map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + change }
          : item,
      )
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const removeItem = (cartItemId) => {
    const updatedCart = cart.filter((item) => item.cartItemId !== cartItemId);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
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
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

            <p className="mt-1 text-sm text-gray-500">
              Review your items before ordering
            </p>
          </div>
        </div>
        {/* Cart Items */}
        <div className="mt-8 space-y-4">
          {cart.length === 0 ? (
            <div className="rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
              <ShoppingBag size={42} className="mx-auto text-gray-300" />

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Your cart is empty
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Add some delicious food from the menu.
              </p>

              <button
                onClick={() => navigate("/menu")}
                className="mt-6 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-4 rounded-3xl border border-black/5 bg-white p-4 shadow-sm"
              >
                {/* Food Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-2xl object-cover"
                />

                {/* Food Info */}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-gray-900">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">₹{item.price}</p>

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
                  {/* Quantity */}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="text-sm font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 transition hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    className="text-gray-400 transition hover:text-red-500"
                    onClick={() => removeItem(item.cartItemId)}
                  >
                    <Trash2 size={18} />
                  </button>

                  <p className="font-bold text-gray-900">
                    ₹{getItemPrice(item) * item.quantity}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your current order total
                </p>
              </div>

              <ShoppingBag size={22} className="text-orange-500" />
            </div>

            <div className="my-5 h-px bg-gray-100" />

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Subtotal</span>

              <span>₹{subtotal}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>Service charge</span>

              <span>₹0</span>
            </div>

            <div className="my-5 h-px bg-gray-100" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>

              <span className="text-xl font-bold text-gray-900">
                ₹{subtotal}
              </span>
            </div>
          </div>
        )}
        {/* Checkout Button */}
        {cart.length > 0 && (
          <button
            onClick={() => navigate("/checkout")}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99]"
          >
            <ShoppingBag size={19} />
            Proceed to Checkout
          </button>
        )}
      </div>
    </div>
  );
};

export default Cart;
