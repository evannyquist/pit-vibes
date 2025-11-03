"use client";

"use client";
import { useTrading } from "@/hooks/useTrading";
import { usePrice } from "@/components/PriceContext";

export default function Positions() {
  const { last: mark } = usePrice();  // ✅ shared price
  const { state, trade, reset, unrealized } = useTrading();
  const uPnl = unrealized(mark);

  // dynamic color helpers
  const posColor =
    state.position > 0
      ? "text-green-600 font-semibold"
      : state.position < 0
      ? "text-red-600 font-semibold"
      : "text-gray-500";
  const uPnlColor =
    uPnl > 0
      ? "text-green-600 font-semibold"
      : uPnl < 0
      ? "text-red-600 font-semibold"
      : "text-gray-500";
  const rPnlColor =
    state.realizedPnl > 0
      ? "text-green-600 font-semibold"
      : state.realizedPnl < 0
      ? "text-red-600 font-semibold"
      : "text-gray-500";
      
  const canFlatten = state.position !== 0;
  const handleFlatten = () => {
    if (!canFlatten) return;
    const qty = Math.abs(state.position);
    const side = state.position > 0 ? "SELL" : "BUY";
    trade({ ts: Date.now(), side, qty, price: mark });
  };

  // light background tint based on position direction
  /*
  const bgTint =
    state.position > 0
      ? "bg-green-400"
      : state.position < 0
      ? "bg-red-400"
      : "bg-gray-600";
    */

  const side = state.position > 0 ? "LONG" : state.position < 0 ? "SHORT" : "FLAT";
  const bannerClasses =
    state.position > 0
      ? "bg-green-100 text-green-800 border-green-200"
      : state.position < 0
      ? "bg-red-100 text-red-800 border-red-200"
      : "hidden"; // hide banner when flat

  return (
    <div className={`relative rounded-2xl p-4 shadow border grid gap-3 transition-colors duration-300`}>
      {/* Floating banner (only when not flat) */}
      {state.position !== 0 && (
        <div className={`absolute -top-3 left-4 right-4 mx-auto w-fit rounded-full border px-3 py-1 text-xs tracking-wide ${bannerClasses}`}>
          <span className="font-semibold">{side}</span>
          <span className="opacity-70 mx-2">•</span>
          <span className="font-medium">Qty {Math.abs(state.position)}</span>
          {state.avgPrice ? (
            <>
              <span className="opacity-70 mx-2">•</span>
              <span className="font-medium">@ {state.avgPrice.toFixed(2)}</span>
            </>
          ) : null}
        </div>
      )}

      <div className="flex items-center">
        <div className="font-semibold">Positions</div>
        <button
          onClick={reset}
          className="ml-auto text-xs underline opacity-70 hover:opacity-100"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="opacity-70">Net Qty</div>
        <div className={posColor}>{state.position}</div>

        <div className="opacity-70">Avg Price</div>
        <div>{state.avgPrice ? state.avgPrice.toFixed(2) : "-"}</div>

        <div className="opacity-70">Unrealized</div>
        <div className={uPnlColor}>{uPnl.toFixed(2)}</div>

        <div className="opacity-70">Realized</div>
        <div className={rPnlColor}>{state.realizedPnl.toFixed(2)}</div>
      </div>

      <div className="mt-2">
        <div className="text-sm opacity-70 mb-1">Trades</div>
        <div className="max-h-40 overflow-auto border rounded">
          {state.trades.length === 0 ? (
            <div className="p-3 text-sm opacity-60">No trades yet.</div>
          ) : (
            state.trades
              .slice()
              .reverse()
              .map((t, i) => (
                <div key={i} className="flex text-sm px-3 py-1 border-b last:border-b-0">
                  <div className="w-14">{t.side}</div>
                  <div className="w-14">{t.qty}</div>
                  <div className="w-20">{t.price.toFixed(2)}</div>
                  <div className="ml-auto opacity-60">{new Date(t.ts).toLocaleTimeString()}</div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
