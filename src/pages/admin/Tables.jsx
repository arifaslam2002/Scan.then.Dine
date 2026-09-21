import { useEffect, useState } from "react";
import api from "../../services/api";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
const Tables = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const [tableResponse, orderResponse] = await Promise.all([
          api.get("/tables"),
          api.get("/orders")
        ]);

        setTables(tableResponse.data);
        setOrders(orderResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();

    const handleTableStatusUpdate = ({ tableNumber, status }) => {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.tableNumber === tableNumber
            ? {
                ...table,
                status,
              }
            : table,
        ),
      );
    };

    socket.on("tableStatusUpdated", handleTableStatusUpdate);

    return () => {
      socket.off("tableStatusUpdated", handleTableStatusUpdate);
    };
  }, []);
  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = `${tableNumber}-qr.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  const printQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);

    const image = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");

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
      printWindow.print();
    };
  };
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Admin Dashboard</p>

              <h1 className="text-2xl font-bold text-gray-900">
                Table QR Codes
              </h1>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
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
                <div className="p-3 bg-white border border-gray-100 rounded-2xl">
                  <QRCodeCanvas
                    id={`qr-${table}`}
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
                    onClick={() => printQR(tableNumber)}
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
