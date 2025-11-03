// app/api/price/stream/route.ts
export const runtime = "edge";

let price = 100; // shared with this route's module scope

function tick(p: number) {
  // small random walk
  const next = +(p + (Math.random() - 0.5) * 0.4).toFixed(2);
  return next;
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send an initial snapshot immediately
      const send = () => {
        const payload = JSON.stringify({ price, ts: Date.now() });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      send();

      // Update price and push every 500ms
      const id = setInterval(() => {
        price = tick(price);
        send();
      }, 500);

      // Cleanup on disconnect
      const cancel = () => clearInterval(id as unknown as number);
      // @ts-expect-error edge runtime uses non-standard controller
      controller.signal?.addEventListener?.("abort", cancel);
    },
    cancel() {
      // nothing extra
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-no-compression": "1",
    },
  });
}
