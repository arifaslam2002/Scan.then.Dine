import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
const FinalBill = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [parcelOrder, setParcelOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const orderType = localStorage.getItem("orderType") || "dine-in";
  const isParcel = orderType === "parcel";
  useEffect(() => {
    const fetchBill = async () => {
      try {
        if (isParcel) {
          const orderId = localStorage.getItem("activeOrderId");

          if (!orderId) {
            navigate("/");
            return;
          }

          const response = await api.get(`/orders/${orderId}`);

          setParcelOrder(response.data);
          setOrders([response.data]);
        } else {
          const sessionId = localStorage.getItem("sessionId");

          if (!sessionId) {
            navigate("/");
            return;
          }

          const response = await api.get(`/dining-sessions/${sessionId}`);

          setSession(response.data.session);
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error("Failed to load bill:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [isParcel, navigate]);
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (isParcel) {
          const orderId = localStorage.getItem("activeOrderId");

          if (!orderId) return;

          const response = await api.get(`/orders/${orderId}`);

          const order = response.data;

          setParcelOrder(order);
          setOrders([order]);

          if (order.paymentStatus === "paid") {
            setPaymentConfirmed(true);

            if (!redirecting) {
              setRedirecting(true);

              setTimeout(() => {
                navigate("/review-order");
              }, 2000);
            }
          }
        } else {
          const sessionId = localStorage.getItem("sessionId");

          if (!sessionId) return;

          const response = await api.get(`/dining-sessions/${sessionId}`);

          setSession(response.data.session);

          if (response.data.session.paymentStatus === "paid") {
            setPaymentConfirmed(true);

            if (!redirecting) {
              setRedirecting(true);

              setTimeout(() => {
                navigate("/review-order");
              }, 2000);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check payment status:", error);
      }
    };

    const interval = setInterval(checkPaymentStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isParcel, redirecting, navigate]);
  const getItemTotal = (item) => {
    const addonsTotal = (item.addons || []).reduce(
      (total, addon) => total + Number(addon.price || 0),
      0,
    );

    return (Number(item.price) + addonsTotal) * Number(item.quantity);
  };

  const getOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const totalAmount = orders.reduce(
    (total, order) => total + getOrderTotal(order),
    0,
  );

  const paymentOptions = [
    {
      id: "cash",
      label: "Cash",
      description: "Pay at the counter",
      icon: Banknote,
    },
    {
      id: "upi",
      label: "UPI",
      description: "Pay using UPI",
      icon: Smartphone,
    },
    {
      id: "card",
      label: "Card",
      description: "Pay using card",
      icon: CreditCard,
    },
  ];

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    try {
      setLoading(true);

      if (isParcel) {
        const orderId = localStorage.getItem("activeOrderId");

        if (!orderId) {
          alert("Parcel order not found");
          return;
        }

        const response = await api.patch(`/orders/${orderId}/payment`, {
          paymentMethod,
        });

        setParcelOrder(response.data.order);
        setOrders([response.data.order]);

        alert(
          "Payment request sent to the counter. Please wait for confirmation.",
        );
      } else {
        const sessionId = localStorage.getItem("sessionId");

        if (!sessionId) {
          alert("Dining session not found");
          return;
        }

        const response = await api.patch(
          `/dining-sessions/${sessionId}/payment`,
          {
            paymentMethod,
          },
        );

        setSession(response.data.session);

        alert(
          "Payment request sent to the counter. Please wait for confirmation.",
        );
      }
    } catch (error) {
      console.error("Payment request failed:", error);

      alert(error.response?.data?.message || "Unable to request payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading final bill...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-6">
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
            <h1 className="text-xl font-bold text-gray-900">Final Bill</h1>

            <p className="text-sm text-gray-500">
              {isParcel ? "Parcel / Takeaway" : `Table ${session?.tableNumber}`}
            </p>
          </div>
        </div>
        {paymentConfirmed && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="text-green-600" size={30} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-green-800">
              Payment Confirmed
            </h2>

            <p className="mt-2 text-sm text-green-700">
              Your payment has been successfully verified by the counter.
            </p>
          </div>
        )}
        {/* Bill */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="mt-5 space-y-5">
            {orders.map((order, orderIndex) => (
              <div
                key={order._id}
                className="border-b border-gray-100 pb-5 last:border-0"
              >
                <div className="mb-3 flex justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Order {orderIndex + 1}
                  </p>

                  <p className="text-sm font-semibold text-gray-900">
                    ₹{getOrderTotal(order)}
                  </p>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.name} × {item.quantity}
                        </p>

                        {item.addons?.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            {item.addons.map((addon, addonIndex) => (
                              <p key={addonIndex}>
                                + {addon.name} — ₹{addon.price}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="font-medium text-gray-700">
                        ₹{getItemTotal(item)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-2 border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                Total Amount
              </span>

              <span className="text-2xl font-bold text-orange-500">
                ₹{totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>

          <div className="mt-4 space-y-3">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const selected = paymentMethod === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setPaymentMethod(option.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {option.label}
                    </p>

                    <p className="text-xs text-gray-500">
                      {option.description}
                    </p>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      selected
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !paymentMethod}
            className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending Request..." : "Request Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalBill;
