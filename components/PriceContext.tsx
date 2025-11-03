"use client";
import React, { createContext, useContext, useState } from "react";

type PriceContextType = { price: number; setPrice: (n: number) => void };

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [price, setPrice] = useState(100);
  return (
    <PriceContext.Provider value={{ price, setPrice }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const ctx = useContext(PriceContext);
  if (!ctx) throw new Error("usePrice must be used within PriceProvider");
  return ctx;
}
