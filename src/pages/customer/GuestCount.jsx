import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, ArrowRight, ArrowLeft } from "lucide-react";
import api from "../../services/api";

const GuestCount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tableNumber = searchParams.get("table");

  const [capacity, setCapacity] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTable = async () => {
      try {
        if (!tableNumber) {
          setError("Table information is missing.");
          return;
        }

        const response = await api.get(`/tables/${tableNumber}`);

        setCapacity(response.data.capacity);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message || "Unable to load table information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTable();
  }, [tableNumber]);

  const handleContinue = async () => {
    try {
      const response = await api.post("/dining-sessions", {
        tableNumber,
        guestCount,
      });

      const session = response.data.session;

      localStorage.setItem("guestCount", guestCount);
      localStorage.setItem("sessionId", session.sessionId);

      navigate(`/allergies?table=${tableNumber}`);
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Unable to start dining session");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <p className="text-sm text-gray-500">Loading table information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Unable to continue
          </h1>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex w-fit items-center gap-2 text-sm font-medium text-gray-500"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Users size={30} />
          </div>

          <p className="text-sm font-medium text-orange-600">
            Table {tableNumber}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            How many people?
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Tell us how many people are dining at this table.
          </p>

          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <p className="text-sm text-gray-400">Guests</p>

              <p className="mt-2 text-5xl font-bold text-gray-900">
                {guestCount}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Maximum {capacity} people
              </p>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {Array.from({ length: capacity }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setGuestCount(number)}
                    className={`rounded-xl py-3 text-sm font-semibold transition ${
                      guestCount === number
                        ? "bg-orange-500 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    {number}
                  </button>
                ),
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-semibold text-white transition hover:bg-orange-600"
          >
            Continue
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestCount;
