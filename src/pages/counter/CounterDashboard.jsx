import { useEffect, useState } from "react";
import {
  CheckCircle,
  CreditCard,
  LogOut,
  RefreshCw,
  Users,
  Armchair,
  Search,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";

const CounterDashboard = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [guestCount, setGuestCount] = useState(2);
  const [tableSearch, setTableSearch] = useState("");
  const [tablesLoading, setTablesLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const response = await api.get("/tables/availability");
      setTables(response.data);
    } catch (error) {
      console.error("Failed to fetch table availability:", error);
    } finally {
      setTablesLoading(false);
    }
  };
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
    fetchTables();

    const paymentInterval = setInterval(fetchPayments, 5000);
    const tableInterval = setInterval(fetchTables, 5000);

    return () => {
      clearInterval(paymentInterval);
      clearInterval(tableInterval);
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
        {/* Live Table Availability */}
        <section className="mb-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-orange-300">
                  <Armchair size={20} />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Seating Control
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-bold">
                  Live Table Availability
                </h2>

                <p className="mt-1 text-sm text-gray-300">
                  Find the right table for incoming guests.
                </p>
              </div>

              <button
                onClick={fetchTables}
                disabled={tablesLoading}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={tablesLoading ? "animate-spin" : ""}
                />
                Refresh seats
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Quick summary */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total Tables</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {tables.length}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-green-700">Free Seats</p>
                <p className="mt-1 text-2xl font-bold text-green-800">
                  {tables.reduce(
                    (total, table) => total + table.availableSeats,
                    0,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-sm text-orange-700">Seats Needed</p>
                <p className="mt-1 text-2xl font-bold text-orange-800">
                  {guestCount} guests
                </p>
              </div>
            </div>

            {/* Search and guest count */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Find a table
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3">
                  <Search size={18} className="text-gray-400" />
                  <input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search table number..."
                    className="w-full py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Guests to seat
                </label>

                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table cards */}
            {tablesLoading && tables.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading table availability...
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tables
                  .filter((table) =>
                    table.tableNumber
                      .toLowerCase()
                      .includes(tableSearch.trim().toLowerCase()),
                  )
                  .sort((a, b) => b.availableSeats - a.availableSeats)
                  .map((table) => {
                    const canSeat = table.availableSeats >= guestCount;

                    return (
                      <div
                        key={table._id || table.tableNumber}
                        className={`rounded-2xl border p-5 transition ${
                          canSeat
                            ? "border-green-200 bg-green-50/50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Restaurant Table
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-gray-900">
                              {table.tableNumber}
                            </h3>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              canSeat
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {canSeat ? "Can seat group" : "Not enough seats"}
                          </span>
                        </div>

                        <div className="mt-5 flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-500">
                              Seats available
                            </p>
                            <p
                              className={`mt-1 text-3xl font-bold ${
                                canSeat ? "text-green-700" : "text-gray-500"
                              }`}
                            >
                              {table.availableSeats}
                              <span className="text-base font-medium text-gray-400">
                                {" "}
                                / {table.capacity}
                              </span>
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">Occupied</p>
                            <p className="mt-1 flex items-center justify-end gap-1 font-semibold text-gray-700">
                              <Users size={16} />
                              {table.occupiedSeats}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-orange-500 transition-all"
                            style={{
                              width: `${
                                table.capacity > 0
                                  ? Math.min(
                                      100,
                                      (table.occupiedSeats / table.capacity) *
                                        100,
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm">
                          {canSeat ? (
                            <>
                              <Check size={17} className="text-green-600" />
                              <span className="font-medium text-green-700">
                                Suitable for {guestCount}{" "}
                                {guestCount === 1 ? "guest" : "guests"}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">
                              {table.availableSeats === 0
                                ? "No seats currently available"
                                : `Needs ${guestCount - table.availableSeats} more ${
                                    guestCount - table.availableSeats === 1
                                      ? "seat"
                                      : "seats"
                                  }`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {!tablesLoading &&
              tables.filter((table) =>
                table.tableNumber
                  .toLowerCase()
                  .includes(tableSearch.trim().toLowerCase()),
              ).length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  No tables found.
                </p>
              )}

            <p className="mt-5 text-xs text-gray-400">
              Seat counts refresh every 5 seconds. Confirm availability before
              assigning a group.
            </p>
          </div>
        </section>
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
