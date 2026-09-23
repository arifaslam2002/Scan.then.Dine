import { useEffect, useState } from "react";
import { CheckCircle, CreditCard, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";

const CounterDashboard = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);

    try {
      const [dineInResponse, parcelResponse] = await Promise.all([
        api.get("/dining-sessions/payments/pending"),
        api.get("/orders/payments/pending-parcel"),
      ]);

      const dineInPayments = dineInResponse.data.map((payment) => ({
        ...payment,
        paymentType: "dine-in",
        paymentId: payment.sessionId,
      }));

      const parcelPayments = parcelResponse.data.map((payment) => ({
        ...payment,
        paymentType: "parcel",
        paymentId: payment._id,
        totalAmount: payment.totalAmount,
      }));

      setPayments([...dineInPayments, ...parcelPayments]);
    } catch (error) {
      console.error("Failed to fetch pending payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (payment) => {
    const confirmed = window.confirm(
      "Have you verified this customer's payment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      if (payment.paymentType === "parcel") {
        await api.patch(`/orders/${payment._id}/confirm-payment`);
      } else {
        await api.patch(
          `/dining-sessions/${payment.sessionId}/confirm-payment`,
        );
      }

      alert("Payment confirmed successfully");

      fetchPayments();
    } catch (error) {
      console.error("Failed to confirm payment:", error);

      alert(error.response?.data?.message || "Failed to confirm payment");
    }
  };

  useEffect(() => {
    fetchPayments();

    const interval = setInterval(() => {
      fetchPayments();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");

    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Counter Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and confirm customer payments
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Payments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Verify the customer's payment before confirming it.
            </p>
          </div>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Empty state */}
        {payments.length === 0 && !loading && (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <CreditCard size={45} className="mx-auto text-gray-300" />

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No Pending Payments
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Payment requests from customers will appear here.
            </p>
          </div>
        )}

        {/* Payment cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => {
            const isParcel = payment.paymentType === "parcel";

            return (
              <div
                key={payment.paymentId}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-400">
                      {isParcel ? "Order Type" : "Table"}
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      {isParcel ? "Parcel / Takeaway" : payment.tableNumber}
                    </h3>
                  </div>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    Pending
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  {!isParcel && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests</span>

                      <span className="font-medium">{payment.guestCount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method</span>

                    <span className="font-semibold uppercase">
                      {payment.paymentMethod}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total</span>

                      <span className="text-lg font-bold text-orange-600">
                        ₹{payment.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {payment.customerName}
                  </p>

                  {payment.phone && (
                    <p className="mt-1 text-sm text-gray-500">
                      {payment.phone}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleConfirmPayment(payment)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  <CheckCircle size={18} />
                  Confirm Payment
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CounterDashboard;
