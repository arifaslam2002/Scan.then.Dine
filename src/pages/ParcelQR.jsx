import { Download, QrCode, Printer, ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
const ParcelQR = () => {
  const navigate = useNavigate();
  const printQR = () => {
    window.print();
  };
  const parcelUrl = `${window.location.origin}/?type=parcel`;

  const downloadQR = () => {
    const canvas = document.querySelector("#parcel-qr");

    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = "scan-then-dine-parcel-qr.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-10">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => navigate("/admin")}
          className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Back to Admin
        </button>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <QrCode size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Parcel Ordering QR
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Customers can scan this QR to place takeaway orders.
          </p>

          <div className="mt-6 flex justify-center rounded-2xl border border-gray-200 bg-white p-5">
            <QRCodeCanvas
              id="parcel-qr"
              value={parcelUrl}
              size={220}
              level="H"
            />
          </div>

          <p className="mt-4 break-all text-xs text-gray-400">{parcelUrl}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              <Download size={18} />
              Download
            </button>

            <button
              onClick={printQR}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Printer size={18} />
              Print QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelQR;
