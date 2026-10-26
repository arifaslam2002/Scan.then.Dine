import { useEffect, useState } from "react";
import api from "../../services/api";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, Printer, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
const Tables = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const [tableResponse, availabilityResponse, orderResponse] =
          await Promise.all([
            api.get("/tables"),
            api.get("/tables/availability"),
            api.get("/orders"),
          ]);

        const availabilityMap = new Map(
          availabilityResponse.data.map((table) => [table.tableNumber, table]),
        );

        const updatedTables = tableResponse.data.map((table) => {
          const availability = availabilityMap.get(table.tableNumber);

          return {
            ...table,
            occupiedSeats: availability?.occupiedSeats ?? 0,
            availableSeats: availability?.availableSeats ?? table.capacity,
            status: availability
              ? availability.availableSeats === 0
                ? "occupied"
                : "available"
              : table.status,
          };
        });

        setTables(updatedTables);
        setOrders(orderResponse.data);
      } catch (error) {
        console.error("Failed to fetch tables:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();

    // Refresh seat availability for the counter
    const interval = setInterval(fetchTables, 10000);

    const handleTableStatusUpdate = ({ tableNumber, status }) => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.tableNumber === tableNumber ? { ...table, status } : table,
        ),
      );
    };

    socket.on("tableStatusUpdated", handleTableStatusUpdate);

    return () => {
      clearInterval(interval);
      socket.off("tableStatusUpdated", handleTableStatusUpdate);
    };
  }, []);

  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);

    if (!canvas) {
      alert("QR code not found");
      return;
    }

    const pngUrl = canvas.toDataURL("image/png");

    const downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = `${tableNumber}-qr.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  const printQR = (tableNumber, capacity) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);

    if (!canvas) {
      alert("QR code not found");
      return;
    }

    const image = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print the QR code.");
      return;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>${tableNumber} QR Code</title>
      </head>

      <body
        style="
          display:flex;
          justify-content:center;
          align-items:center;
          min-height:100vh;
          font-family:Arial;
        "
      >
        <div style="text-align:center;">
          <h1>${tableNumber}</h1>

          <p style="font-size:18px;">
            Capacity: ${capacity || "—"} people
          </p>

          <img
            src="${image}"
            width="300"
            height="300"
          />

          <p style="font-size:18px; margin-top:16px;">
            Scan to view menu & order
          </p>
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };
  const handleAddTable = async (e) => {
    e.preventDefault();

    if (adding) return;

    if (!tableNumber.trim() || Number(capacity) < 1) {
      alert("Enter a valid table number and capacity.");
      return;
    }

    setAdding(true);

    try {
      await api.post("/tables", {
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity),
      });

      // Refresh the table list
      const response = await api.get("/tables");
      setTables(response.data);

      setTableNumber("");
      setCapacity(4);
      setShowAddForm(false);

      alert("Table added successfully!");
    } catch (error) {
      console.error("Failed to add table:", error);

      alert(error.response?.data?.message || "Failed to add table.");
    } finally {
      setAdding(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Admin Dashboard</p>

              <h1 className="text-2xl font-bold text-gray-900">
                Table QR Codes
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white transition hover:bg-orange-600"
              >
                <Plus size={18} />
                Add Table
              </button>

              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Add New Table
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the table details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTable} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Table Number
                  </label>

                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Example: T-06"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Seating Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    disabled={adding}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {adding ? "Adding..." : "Save Table"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Restaurant Tables
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Download and place each QR code on its corresponding table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tables.map((table) => {
            const tableNumber = table.tableNumber;
            const activeOrders = orders.filter(
              (order) =>
                order.tableNumber === tableNumber &&
                !["served", "cancelled"].includes(order.status),
            );
            const url = `${window.location.origin}/?table=${tableNumber}`;

            return (
              <div
                key={tableNumber}
                className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col items-center"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {tableNumber}
                </h3>
                <div
                  className={`mb-4 px-3 py-1.5 rounded-full text-xs font-medium ${
                    table.status === "occupied"
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {table.status === "occupied" ? "Occupied" : "Available"}
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {activeOrders.length}{" "}
                  {activeOrders.length === 1 ? "Active Order" : "Active Orders"}
                </p>

                <div className="mb-4 grid w-full grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-gray-50 p-2">
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="mt-1 font-semibold">{table.capacity}</p>
                  </div>

                  <div className="rounded-xl bg-red-50 p-2">
                    <p className="text-xs text-red-600">Occupied</p>
                    <p className="mt-1 font-semibold text-red-700">
                      {table.occupiedSeats}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-2">
                    <p className="text-xs text-green-600">Seats Left</p>
                    <p className="mt-1 font-semibold text-green-700">
                      {table.availableSeats}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                  <QRCodeCanvas
                    id={`qr-${tableNumber}`}
                    value={url}
                    size={180}
                    level="H"
                  />
                </div>

                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    Scan to view menu & order
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Table {tableNumber}
                  </p>
                  <p className="mb-3 text-sm text-gray-500">
                    Capacity:{" "}
                    <span className="font-semibold text-gray-700">
                      {table.capacity} people
                    </span>
                  </p>
                </div>

                <div className="w-full flex gap-2 mt-4">
                  <button
                    onClick={() => downloadQR(tableNumber)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
                  >
                    <Download size={17} />
                    Download
                  </button>

                  <button
                    onClick={() => printQR(tableNumber, table.capacity)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    <Printer size={17} />
                    Print
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Tables;
