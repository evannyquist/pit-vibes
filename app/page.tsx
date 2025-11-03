import Providers from "@/components/Providers";
import TopBar from "@/components/TopBar";
import Chart from "@/components/Chart";
import OrderBook from "@/components/OrderBook";
import GreeksPanel from "@/components/GreeksPanel";

export default function Home() {
  return (
    <Providers>
      <main className="min-h-screen p-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Pit Vibes Terminal</h1>

        <TopBar />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <Chart />
            <GreeksPanel />
          </div>
          <div className="md:col-span-1">
            <OrderBook />
          </div>
        </div>
      </main>
    </Providers>
  );
}
