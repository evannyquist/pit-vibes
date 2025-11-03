"use client";
import { useMemo } from "react";
import { usePrice } from "./PriceContext";
import { useSettings } from "./SettingsContext";

export default function GreeksPanel() {
  const { last } = usePrice();           // ✅ unified price from API/SSE
  const { showGreeks } = useSettings();

  const greeks = useMemo(() => {
    // MOCK greeks around ATM=100 for a short-dated instrument
    const spot = last ?? 100;

    const delta = Math.max(-1, Math.min(1, (spot - 100) / 10));   // ~[-1,1]
    const gamma = 0.02 + Math.abs(100 - spot) * 0.0005;           // increases off-ATM
    const theta = -0.01 * (1 + Math.abs(100 - spot) * 0.01);      // negative carry
    const vega  = 0.15;                                           // placeholder constant

    return {
      delta: Number(delta.toFixed(2)),
      gamma: Number(gamma.toFixed(3)),
      theta: Number(theta.toFixed(3)),
      vega:  Number(vega.toFixed(2)),
    };
  }, [last]);

  if (!showGreeks) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:max-w-md">
      {[
        ["Δ (Delta)", greeks.delta, "text-blue-300"],
        ["Γ (Gamma)", greeks.gamma, "text-green-300"],
        ["Θ (Theta)", greeks.theta, "text-red-300"],
        ["V (Vega)",  greeks.vega,  "text-purple-300"],
      ].map(([label, val, cls]) => (
        <div key={label as string} className="rounded-xl border border-white/10 p-3 bg-white/5">
          <div className="text-xs text-gray-400">{label}</div>
          <div className={`font-mono text-lg ${cls as string}`}>{val as number}</div>
        </div>
      ))}
    </div>
  );
}
