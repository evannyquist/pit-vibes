"use client";
import React, { createContext, useContext, useState } from "react";

type Settings = {
  pitMode: boolean;
  setPitMode: (v: boolean) => void;
  speedMs: number;              // tick cadence for chart/book
  setSpeedMs: (n: number) => void;
  showGreeks: boolean;
  setShowGreeks: (v: boolean) => void;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [pitMode, setPitMode] = useState(false);
  const [speedMs, setSpeedMs] = useState(500); // default 500ms
  const [showGreeks, setShowGreeks] = useState(false);

  return (
    <SettingsContext.Provider
      value={{ pitMode, setPitMode, speedMs, setSpeedMs, showGreeks, setShowGreeks }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
