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
import { useSettings } from "./SettingsContext";

function addLineCompat(
  chart: IChartApi,
  options: { color?: string; lineWidth?: number }
): ISeriesApi<"Line"> {
  // Newer API (>=5.1)
  const anyChart = chart as any;
  if (typeof anyChart.addLineSeries === "function") {
    return anyChart.addLineSeries(options) as ISeriesApi<"Line">;
  }
  // Transitional v5.0.x APIs
  if (typeof anyChart.addSeries === "function") {
    try {
      // Most reliable on 5.0.9 runtime is lowercase "line"
      return anyChart.addSeries("line", options) as ISeriesApi<"Line">;
    } catch {
      // Some builds still accept "Line"
      return anyChart.addSeries("Line", options) as ISeriesApi<"Line">;
    }
  }
  throw new Error("Incompatible lightweight-charts version: cannot add line series");
}


export default function Chart() {
  const container = useRef<HTMLDivElement>(null);

  // Refs for chart, series, timer, and last price
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const priceRef = useRef<number>(100);

  const { setPrice } = usePrice();
  const { speedMs } = useSettings();

  // === Create chart once ===
  useEffect(() => {
    if (!container.current || chartRef.current) return;

    const chart = createChart(container.current, {
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "white",
      },
    });
    chartRef.current = chart;

    // replace your current addSeries line with:
    const line = chart.addLineSeries({ color: "#22d3ee", lineWidth: 2 });
    seriesRef.current = line;


    // Handle responsive width
    const handleResize = () => {
      if (container.current && chartRef.current) {
        chartRef.current.applyOptions({ width: container.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // Seed initial history
    const points = 150;
    const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
    let value = 100;
    const initialData = Array.from({ length: points }, (_, i) => {
      if (i > 0) value += Math.random() - 0.5;
      const t = (now - (points - i)) as UTCTimestamp;
      return { time: t, value };
    });
    line.setData(initialData);

    priceRef.current = initialData[initialData.length - 1].value;
    setPrice(priceRef.current);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Live ticker controlled by speedMs ===
  useEffect(() => {
    if (!seriesRef.current) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      priceRef.current += Math.random() - 0.5;
      setPrice(priceRef.current);
      const t = Math.floor(Date.now() / 1000) as UTCTimestamp;
      seriesRef.current!.update({ time: t, value: priceRef.current });
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [speedMs, setPrice]);

  return <div ref={container} className="w-full h-[400px]" />;
}
