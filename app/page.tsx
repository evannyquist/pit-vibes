"use client";

import { useEffect, useState } from "react";

import Providers from "@/components/Providers";
import TopBar from "@/components/TopBar";
import Chart from "@/components/Chart";
import OrderBook from "@/components/OrderBook";
import GreeksPanel from "@/components/GreeksPanel";

import TradePanel from "@/components/TradePanel";
import Positions from "@/components/Positions";
import { TradingProvider } from "@/hooks/useTrading";

export default function Home() {
  const [last, setLast] = useState(100);

  useEffect(() => {
    const id = setInterval(() => {
      setLast((p) => +(p + (Math.random() - 0.5) * 0.4).toFixed(2));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <Providers>
      <TradingProvider>
        <main className="min-h-screen p-6">
          <div className="flex items-baseline gap-3 mb-4">
            <h1 className="text-3xl font-bold text-primary">Pit Vibes Terminal</h1>
            <span className="text-sm opacity-60">LAST</span>
            <span className="text-2xl font-semibold">{last.toFixed(2)}</span>
          </div>

          <TopBar />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
              <Chart />
              <GreeksPanel />
            </div>

            <div className="md:col-span-1 grid gap-6">
              <OrderBook />
              <TradePanel last={last} />
              <Positions mark={last} />
            </div>
          </div>
        </main>
      </TradingProvider>
    </Providers>
  );
}
