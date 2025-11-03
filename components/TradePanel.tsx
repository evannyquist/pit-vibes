"use client";
import { useState } from "react";
import { useTrading } from "@/hooks/useTrading";

export default function TradePanel({ last }: { last: number }) {
  const { trade } = useTrading();
  const [qty, setQty] = useState(1);

  const submit = (side: "BUY" | "SELL") => {
    trade({ ts: Date.now(), side, qty: Math.max(1, qty), price: last });
  };

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
        <button onClick={() => submit("BUY")} className="rounded-2xl px-4 py-2 shadow border hover:opacity-90">
          Buy
        </button>
        <button onClick={() => submit("SELL")} className="rounded-2xl px-4 py-2 shadow border hover:opacity-90">
          Sell
        </button>
      </div>
    </div>
  );
}
