"use client";

import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";
import { usePrice } from "@/components/PriceContext";

export default function TradePanel() {
  const { trade, state } = useTrading();
  const { last } = usePrice();

  const [qty, setQty] = useState(1);
  const [flashSide, setFlashSide] = useState<"BUY" | "SELL" | null>(null);

  const handleTrade = (side: "BUY" | "SELL") => {
    trade({ ts: Date.now(), side, qty: Math.max(1, qty), price: last });
    setFlashSide(side);
    setTimeout(() => setFlashSide(null), 200);
  };

  // --- FLATTEN ---
  const canFlatten = state.position !== 0;
  const flattenSide: "BUY" | "SELL" = state.position > 0 ? "SELL" : "BUY";
  const handleFlatten = () => {
    if (!canFlatten) return;
    const fullQty = Math.abs(state.position);
    trade({ ts: Date.now(), side: flattenSide, qty: fullQty, price: last });
    // optional: briefly flash the side we executed to flatten
    setFlashSide(flattenSide);
    setTimeout(() => setFlashSide(null), 200);
  };

  // Darker, legible flashes
  const buyFlash =
    flashSide === "BUY"
      ? "bg-green-600 text-white animate-press"
      : "hover:bg-green-700 hover:text-white";
  const sellFlash =
    flashSide === "SELL"
      ? "bg-red-600 text-white animate-press"
      : "hover:bg-red-700 hover:text-white";

  return (
    <div className="rounded-2xl p-4 shadow border grid gap-3">
      <div className="text-sm opacity-70">Trade Underlying</div>

      <div className="flex items-center gap-3">
        <label className="text-sm w-16">Qty</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || "1", 10))}
          className="border rounded px-2 py-1 w-24"
          min={1}
        />
        <div className="ml-auto text-sm">Last: {last.toFixed(2)}</div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleTrade("BUY")}
          className={`rounded-2xl px-4 py-2 shadow border transition-all duration-150 active:scale-95 ${buyFlash}`}
        >
          Buy
        </button>
        <button
          onClick={() => handleTrade("SELL")}
          className={`rounded-2xl px-4 py-2 shadow border transition-all duration-150 active:scale-95 ${sellFlash}`}
        >
          Sell
        </button>

        {/* Flatten button */}
        <button
          onClick={handleFlatten}
          disabled={!canFlatten}
          className={`ml-auto rounded-2xl px-4 py-2 shadow border transition-all duration-150 active:scale-95
            ${canFlatten ? "bg-white/80 hover:bg-white text-gray-900" : "bg-white/20 text-gray-400 cursor-not-allowed"}`}
          title={canFlatten ? `Flatten @ ${last.toFixed(2)}` : "No open position"}
        >
          Flatten
        </button>
      </div>
    </div>
  );
}
