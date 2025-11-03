"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export type Side = "BUY" | "SELL";

export interface Trade {
  ts: number;
  side: Side;
  qty: number;
  price: number;
}

export interface PositionState {
  trades: Trade[];
  position: number;
  avgPrice: number;
  realizedPnl: number;
}

export const initialState: PositionState = {
  trades: [],
  position: 0,
  avgPrice: 0,
  realizedPnl: 0,
};

function unrealizedPnlInternal(s: PositionState, mark: number): number {
  if (s.position === 0) return 0;
  const dir = Math.sign(s.position);
  return (mark - s.avgPrice) * dir * Math.abs(s.position);
}

function applyTrade(s: PositionState, t: Trade): PositionState {
  let { position, avgPrice, realizedPnl } = s;
  const signedQty = t.side === "BUY" ? t.qty : -t.qty;

  if (position !== 0 && Math.sign(position) !== Math.sign(position + signedQty)) {
    const closeQty = Math.abs(position);
    const openQty = Math.abs(signedQty) - closeQty;
    realizedPnl += (t.price - avgPrice) * (-Math.sign(position)) * closeQty;
    position = 0;
    avgPrice = 0;
    if (openQty > 0) {
      position = Math.sign(signedQty) * openQty;
      avgPrice = t.price;
    }
  } else {
    const newPos = position + signedQty;

    if (position === 0) {
      avgPrice = t.price;
    } else {
      if (Math.sign(position) === Math.sign(signedQty)) {
        // add in same direction → weighted avg
        avgPrice = (Math.abs(position) * avgPrice + Math.abs(signedQty) * t.price) / Math.abs(newPos);
      } else {
        // partial reduce
        const closingQty = Math.min(Math.abs(position), Math.abs(signedQty));
        realizedPnl += (t.price - avgPrice) * (-Math.sign(position)) * closingQty;
        if (Math.sign(newPos) === 0) avgPrice = 0;
      }
    }
    position = newPos;
  }

  return {
    trades: [...s.trades, t],
    position,
    avgPrice,
    realizedPnl,
  };
}

type Action =
  | { type: "TRADE"; payload: Trade }
  | { type: "RESET" };

const KEY = "pitvibes_trading_v1";

function reducer(state: PositionState, action: Action): PositionState {
  switch (action.type) {
    case "TRADE":
      return applyTrade(state, action.payload);
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ---------- Context ----------
type TradingCtx = {
  state: PositionState;
  trade: (t: Trade) => void;
  reset: () => void;
  unrealized: (mark: number) => number;
};

const Ctx = createContext<TradingCtx | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PositionState) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo<TradingCtx>(() => ({
    state,
    trade: (t: Trade) => dispatch({ type: "TRADE", payload: t }),
    reset: () => dispatch({ type: "RESET" }),
    unrealized: (mark: number) => unrealizedPnlInternal(state, mark),
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrading() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTrading must be used within <TradingProvider>");
  return ctx;
}
