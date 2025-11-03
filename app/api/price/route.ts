// app/api/price/route.ts
export const runtime = "edge";

// Module-scoped state (persists per edge isolate/process)
let price = 100;

export async function GET() {
  return new Response(JSON.stringify({ price, ts: Date.now() }), {
    headers: { "content-type": "application/json", "cache-control": "no-cache" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (typeof body?.price !== "number") {
      return new Response(JSON.stringify({ error: "price must be a number" }), { status: 400 });
    }
    price = body.price;
    return new Response(JSON.stringify({ ok: true, price, ts: Date.now() }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400 });
  }
}
