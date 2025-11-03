"use client";
import { PriceProvider } from "./PriceContext";
import { SettingsProvider } from "./SettingsContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PriceProvider>{children}</PriceProvider>
    </SettingsProvider>
  );
}
