"use client";
import { usePrice } from "./PriceContext";
import { useSettings } from "./SettingsContext";
import { useMemo } from "react";

export default function GreeksPanel() {
  const { price } = usePrice();
  const { showGreeks } = useSettings();

  const greeks = useMemo(() => {
    // MOCK: pretend we're valuing an at-the-money, short-dated instrument
    // Just to display something plausible-looking.
    const delta = Math.max(-1, Math.min(1, (price - 100) / 10)); // ~[-1,1]
    const gamma = 0.02 + Math.abs(100 - price) * 0.0005;         // rises as you move off ATM
    const theta = -0.01 * (1 + Math.abs(100 - price) * 0.01);    // negative carry
    const vega = 0.15;                                           // constant placeholder
    return {
      delta: Number(delta.toFixed(2)),
      gamma: Number(gamma.toFixed(3)),
      theta: Number(theta.toFixed(3)),
      vega: Number(vega.toFixed(2)),
    };
  }, [price]);

  if (!showGreeks) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:max-w-md">
      {[
        ["Δ (Delta)", greeks.delta, "text-blue-300"],
        ["Γ (Gamma)", greeks.gamma, "text-green-300"],
        ["Θ (Theta)", greeks.theta, "text-red-300"],
        ["V (Vega)", greeks.vega, "text-purple-300"],
      ].map(([label, val, cls]) => (
        <div key={label as string} className="rounded-xl border border-white/10 p-3 bg-white/5">
          <div className="text-xs text-gray-400">{label}</div>
          <div className={`font-mono text-lg ${cls as string}`}>{val as number}</div>
        </div>
      ))}
    </div>
  );
}
