"use client";
import { useEffect, useRef } from "react";
import { useSettings } from "./SettingsContext";
import { usePrice } from "@/components/PriceContext";

export default function TopBar() {
  const { pitMode, setPitMode, speedMs, setSpeedMs, showGreeks, setShowGreeks } =
    useSettings();
  const { last } = usePrice(); // ✅ shared price
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto play/pause crowd noise
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (pitMode) {
      a.loop = true;
      a.volume = 0.2;
      a.play().catch(() => {
        /* ignore autoplay block */
      });
    } else {
      a.pause();
      a.currentTime = 0;
    }
  }, [pitMode]);

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Pit mode */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={pitMode}
            onChange={(e) => setPitMode(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">🎧 Pit Mode (crowd noise)</span>
        </label>

        {/* Flow speed */}
        <div className="flex items-center gap-3">
          <span className="text-sm">🔥 Flow Speed</span>
          <input
            type="range"
            min={80}
            max={1200}
            step={20}
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
          />
          <span className="font-mono text-xs">{speedMs} ms</span>
        </div>

        {/* Show greeks */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showGreeks}
            onChange={(e) => setShowGreeks(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">⚖️ Show Greeks</span>
        </label>

        {/* 📈 Live price display */}
        <div className="ml-auto flex items-baseline gap-2 font-mono">
          <span className="text-xs opacity-60">LAST</span>
          <span className="text-lg font-semibold text-cyan-300">
            {last.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ambient audio */}
      <audio ref={audioRef} src="/pit-ambience.mp3" />
    </div>
  );
}
