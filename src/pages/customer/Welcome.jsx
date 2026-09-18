import { ArrowRight, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <QrCode size={21} />
          </div>

          <span className="text-lg font-bold tracking-tight">
            Scan<span className="text-orange-500">.</span>Then<span className="text-orange-500">.</span>Dine
          </span>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Table T-05
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex max-w-6xl items-center justify-center px-5 pb-12 pt-10 sm:px-8 lg:min-h-[calc(100vh-88px)] lg:pt-0">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">

          {/* Left */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
              <Sparkles size={16} />
              Welcome to your table
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Your table.
              <br />
              Your menu.
              <br />
              <span className="text-orange-500">Your way.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-500 sm:text-lg">
              Browse the menu, customize your experience, and order directly
              from your table — no waiting, no hassle.
            </p>

            {/* Table Card */}
            <div className="mt-8 flex max-w-md items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <QrCode size={23} />
              </div>

              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Ordering from
                </p>

                <p className="mt-1 font-semibold">
                  Table T-05
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
                <ShieldCheck size={17} />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("/allergies")}
              className="group mt-6 flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-[#171717] px-6 py-4 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-xl"
            >
              Start Ordering

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={17} />
              </span>
            </button>

            <p className="mt-4 max-w-md text-center text-xs text-gray-400">
              Your order will be linked to this table automatically.
            </p>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block">
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-orange-200/40 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white p-4 shadow-2xl shadow-black/5">
              <div className="overflow-hidden rounded-[1.5rem] bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80"
                  alt="Restaurant food"
                  className="h-[500px] w-full object-cover"
                />
              </div>

              {/* Floating card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      Today's experience
                    </p>

                    <p className="mt-1 font-semibold">
                      Fresh food. Faster ordering.
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white">
                    4.9 ★
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Welcome;