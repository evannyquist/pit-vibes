"use client";

import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { usePrice } from "./PriceContext";

/** Compat helper across lightweight-charts 5.x APIs */
function addLineCompat(
  chart: IChartApi,
  options: { color?: string; lineWidth?: number }
): ISeriesApi<"Line"> {
  const anyChart = chart as any;
  if (typeof anyChart.addLineSeries === "function") {
    return anyChart.addLineSeries(options) as ISeriesApi<"Line">;
  }
  if (typeof anyChart.addSeries === "function") {
    try {
      return anyChart.addSeries("line", options) as ISeriesApi<"Line">;
    } catch {
      return anyChart.addSeries("Line", options) as ISeriesApi<"Line">;
    }
  }
  throw new Error("Incompatible lightweight-charts version: cannot add line series");
}

export default function Chart() {
  const container = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastTimeRef = useRef<number>(0); // ensure strictly increasing times

  // ✅ Read the shared price; don't generate your own
  const { last } = usePrice();

  // Create chart once
  useEffect(() => {
    if (!container.current || chartRef.current) return;

    const chart = createChart(container.current, {
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "white",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      rightPriceScale: { borderColor: "#334155" },
      timeScale: { borderColor: "#334155" },
    });
    chartRef.current = chart;

    const line = addLineCompat(chart, { color: "#22d3ee", lineWidth: 2 });
    seriesRef.current = line;

    // Responsive width
    const handleResize = () => {
      if (container.current && chartRef.current) {
        chartRef.current.applyOptions({ width: container.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // Seed initial history around current last
    const points = 150;
    const nowSec = Math.floor(Date.now() / 1000);
    let value = last || 100;
    const initialData = Array.from({ length: points }, (_, i) => {
      if (i > 0) value += (Math.random() - 0.5) * 0.6; // tiny random walk just for history
      const t = (nowSec - (points - i)) as UTCTimestamp;
      return { time: t, value: +value.toFixed(2) };
    });
    line.setData(initialData);
    lastTimeRef.current = initialData[initialData.length - 1].time as number;

    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Append a point whenever the shared price changes
  useEffect(() => {
    if (!seriesRef.current) return;
    // ensure time strictly increases (some environments can emit multiple updates within the same second)
    const t = Math.max(Math.floor(Date.now() / 1000), lastTimeRef.current + 1) as UTCTimestamp;
    lastTimeRef.current = t as number;

    seriesRef.current.update({ time: t, value: +last.toFixed(2) });
  }, [last]);

  return <div ref={container} className="w-full h-[400px]" />;
}
