"use client";
import { useEffect, useMemo, useState } from "react";
import { usePrice } from "./PriceContext";
import { useSettings } from "./SettingsContext";

type Level = { price: number; size: number; flash: boolean };

const LEVELS = 5;   // depth on each side
const TICK = 0.05;  // price spacing between levels

export default function OrderBook() {
  const { last } = usePrice();           // shared last price from the chart
  const price = last;
  const { speedMs } = useSettings();      // shared cadence from TopBar slider
  const [bids, setBids] = useState<Level[]>([]);
  const [asks, setAsks] = useState<Level[]>([]);

  // Build a book centered around the given mid price
  const buildBook = (m: number) => {
    const newBids: Level[] = Array.from({ length: LEVELS }, (_, i) => {
      const p = +(m - (i + 1) * TICK).toFixed(2);
      return { price: p, size: Math.floor(5 + Math.random() * 95), flash: true };
    });
    const newAsks: Level[] = Array.from({ length: LEVELS }, (_, i) => {
      const p = +(m + (i + 1) * TICK).toFixed(2);
      return { price: p, size: Math.floor(5 + Math.random() * 95), flash: true };
    });
    return { newBids, newAsks };
  };

  // Single effect handles both: rebuild immediately on price change,
  // and keep rebuilding on an interval controlled by speedMs.
  useEffect(() => {
    const buildAndFlash = () => {
      const { newBids, newAsks } = buildBook(price);
      setBids(newBids);
      setAsks(newAsks);
      // brief flash so rows "blink" when updated
      const off = setTimeout(() => {
        setBids((b) => b.map((l) => ({ ...l, flash: false })));
        setAsks((a) => a.map((l) => ({ ...l, flash: false })));
      }, 120);
      return () => clearTimeout(off);
    };

    // Do one immediately (covers price changes)
    const cancelFlash = buildAndFlash();

    // Then keep updating on the chosen cadence
    const id = setInterval(buildAndFlash, speedMs);

    return () => {
      clearInterval(id);
      cancelFlash?.(); // clear the most recent flash timeout
    };
  }, [price, speedMs]);

  const bestBid = useMemo(() => bids[0]?.price ?? null, [bids]);
  const bestAsk = useMemo(() => asks[0]?.price ?? null, [asks]);

  return (
    <div className="w-full md:max-w-sm lg:max-w-md">
      {/* Last traded / mid proxy */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-400">LAST</div>
        <div className="font-mono">{price.toFixed(2)}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* BIDS */}
        <div>
          <div className="text-xs text-green-400 mb-1">Bids</div>
          <div className="overflow-hidden rounded-xl border border-green-900/40">
            <table className="w-full text-sm font-mono">
              <tbody>
                {bids.map((l, i) => (
                  <tr
                    key={`b-${i}-${l.price}`}
                    className={`transition-colors ${
                      l.flash ? "bg-green-900/30" : "bg-transparent"
                    }`}
                  >
                    <td className="px-2 py-1 text-green-300">{l.price.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right text-green-200">{l.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASKS */}
        <div>
          <div className="text-xs text-red-400 mb-1">Asks</div>
          <div className="overflow-hidden rounded-xl border border-red-900/40">
            <table className="w-full text-sm font-mono">
              <tbody>
                {asks.map((l, i) => (
                  <tr
                    key={`a-${i}-${l.price}`}
                    className={`transition-colors ${
                      l.flash ? "bg-red-900/30" : "bg-transparent"
                    }`}
                  >
                    <td className="px-2 py-1 text-red-300">{l.price.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right text-red-200">{l.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Best bid / ask */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <div>
          Best Bid:{" "}
          <span className="text-green-300 font-mono">
            {bestBid?.toFixed?.(2)}
          </span>
        </div>
        <div>
          Best Ask:{" "}
          <span className="text-red-300 font-mono">
            {bestAsk?.toFixed?.(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
