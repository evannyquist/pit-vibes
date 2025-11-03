"use client";
import { useTrading } from "@/hooks/useTrading";

export default function Positions({ mark }: { mark: number }) {
  const { state, reset, unrealized } = useTrading();
  const uPnl = unrealized(mark);

  return (
    <div className="rounded-2xl p-4 shadow border grid gap-3">
      <div className="flex items-center">
        <div className="font-semibold">Positions</div>
        <button onClick={reset} className="ml-auto text-xs underline opacity-70">Reset</button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="opacity-70">Net Qty</div><div>{state.position}</div>
        <div className="opacity-70">Avg Price</div><div>{state.avgPrice ? state.avgPrice.toFixed(2) : "-"}</div>
        <div className="opacity-70">Unrealized</div><div>{uPnl.toFixed(2)}</div>
        <div className="opacity-70">Realized</div><div>{state.realizedPnl.toFixed(2)}</div>
      </div>

      <div className="mt-2">
        <div className="text-sm opacity-70 mb-1">Trades</div>
        <div className="max-h-40 overflow-auto border rounded">
          {state.trades.length === 0 ? (
            <div className="p-3 text-sm opacity-60">No trades yet.</div>
          ) : state.trades.slice().reverse().map((t, i) => (
            <div key={i} className="flex text-sm px-3 py-1 border-b last:border-b-0">
              <div className="w-14">{t.side}</div>
              <div className="w-14">{t.qty}</div>
              <div className="w-20">{t.price.toFixed(2)}</div>
              <div className="ml-auto opacity-60">{new Date(t.ts).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
