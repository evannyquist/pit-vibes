"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type PriceCtx = {
  last: number;
  setLast: (v: number) => void;
  setMockOn: (on: boolean) => void;
};

const Ctx = createContext<PriceCtx | null>(null);

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [last, setLast] = useState(100);
  const mockOnRef = useRef(true);

  const setMockOn = (on: boolean) => { mockOnRef.current = on; };

  // Fallback local mock (only runs if SSE isn't connected)
  useEffect(() => {
    const id = setInterval(() => {
      if (!mockOnRef.current) return;
      setLast((p) => +(p + (Math.random() - 0.5) * 0.4).toFixed(2));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Prefer SSE stream
  useEffect(() => {
    const es = new EventSource("/api/price/stream");
    es.onmessage = (evt) => {
      try {
        const { price } = JSON.parse(evt.data);
        if (typeof price === "number") {
          mockOnRef.current = false; // disable local mock
          setLast(price);
        }
      } catch {}
    };
    es.onerror = () => {
      // If SSE fails, keep mock running
      mockOnRef.current = true;
    };
    return () => es.close();
  }, []);

  const value = useMemo(() => ({ last, setLast, setMockOn }), [last]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrice() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrice must be used within <PriceProvider>");
  return ctx;
}
