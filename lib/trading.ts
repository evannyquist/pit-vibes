export type Side = "BUY" | "SELL";

export interface Trade {
  ts: number;        // Date.now()
  side: Side;
  qty: number;       // positive
  price: number;     // execution price
}

export interface PositionState {
  trades: Trade[];
  position: number;      // net qty
  avgPrice: number;      // weighted avg for open position
  realizedPnl: number;   // closed P&L
}

export const initialState: PositionState = {
  trades: [],
  position: 0,
  avgPrice: 0,
  realizedPnl: 0,
};

export function applyTrade(s: PositionState, t: Trade): PositionState {
  let { position, avgPrice, realizedPnl } = s;
  const signedQty = t.side === "BUY" ? t.qty : -t.qty;

  // If trade reduces/flip position, realize PnL on the crossed quantity
  if (position !== 0 && Math.sign(position) !== Math.sign(position + signedQty)) {
    // crossing the zero line, split into close then open leg
    const closeQty = Math.abs(position);
    const openQty = Math.abs(signedQty) - closeQty;
    realizedPnl += (t.price - avgPrice) * (-Math.sign(position)) * closeQty;
    position = 0;
    avgPrice = 0;
    if (openQty > 0) {
      // open in direction of signedQty after flat
      position = Math.sign(signedQty) * openQty;
      avgPrice = t.price;
    }
  } else if (position === 0 || Math.sign(position) === Math.sign(position + signedQty)) {
    // same-direction add or open from flat
    const newPos = position + signedQty;
    if (position === 0) {
      avgPrice = t.price;
    } else {
      // weighted average if adding
      if (Math.sign(position) === Math.sign(signedQty)) {
        avgPrice = (Math.abs(position) * avgPrice + Math.abs(signedQty) * t.price) / Math.abs(newPos);
      } else {
        // partial reduce
        const closingQty = Math.min(Math.abs(position), Math.abs(signedQty));
        realizedPnl += (t.price - avgPrice) * (-Math.sign(position)) * closingQty;
        if (Math.abs(signedQty) > Math.abs(position)) {
          // flipped handled above, so here it's partial reduce only
        }
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

export function unrealizedPnl(s: PositionState, mark: number): number {
  if (s.position === 0) return 0;
  const dir = Math.sign(s.position); // +1 long, -1 short
  return (mark - s.avgPrice) * dir * Math.abs(s.position);
}
