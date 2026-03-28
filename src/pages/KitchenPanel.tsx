import { useState, useEffect } from "react";
import { Camera, ChevronDown } from "lucide-react";
import { prepItems, flashSales } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-gray-400">{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>;
}

const tagColors: Record<string, string> = {
  event: "bg-amber/20 text-amber",
  expiry: "bg-coral/20 text-coral",
  weather: "bg-steel/20 text-blue-400",
  peak: "bg-mint/20 text-mint",
};

export default function KitchenPanel() {
  const { flashSaleActive, toggleFlashSale, wasteLogs, addWasteLog } = useApp();
  const [logItem, setLogItem] = useState(prepItems[0].name);
  const [logQty, setLogQty] = useState("");
  const [logUnit, setLogUnit] = useState("g");
  const [logReason, setLogReason] = useState("Over-prepped");
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    toast.info("Scanning... (demo mode)");
    setTimeout(() => setScanning(false), 1200);
  };

  const handleLogWaste = () => {
    if (!logQty) { toast.error("Enter quantity"); return; }
    const now = new Date();
    addWasteLog({
      timestamp: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      item: logItem,
      qty: logQty,
      unit: logUnit,
      reason: logReason,
    });
    setLogQty("");
    toast.success("Waste logged");
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-100 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <span className="font-display text-lg">🧑‍🍳 Kitchen Panel</span>
        <LiveClock />
        <span className="badge-pill bg-accent/20 text-mint text-xs">Service: LUNCH</span>
      </header>

      <div className="flex gap-6 p-6">
        {/* LEFT — Prep List */}
        <div className="w-[60%] space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl">Today's Prep Sheet</h2>
            <span className="badge-pill bg-mint/20 text-mint text-xs">92% AI Accuracy</span>
          </div>
          {prepItems.map((item) => {
            const pct = Math.round((item.prepped / item.target) * 100);
            return (
              <div key={item.id} className="bg-gray-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-base">{item.name}</span>
                  {item.aiTag && (
                    <span className={`badge-pill text-xs ml-auto ${tagColors[item.aiTag.type] || "bg-gray-700 text-gray-300"}`}>
                      {item.aiTag.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>Target: {item.target}</span>
                  <span>Usual: {item.usual}</span>
                  <span>Prepped: {item.prepped}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? "bg-mint" : pct >= 50 ? "bg-accent" : "bg-amber"}`}
                    style={{ width: `${pct}%` }} />
                </div>
                {item.expiryAlert && (
                  <div className="flex items-center justify-between bg-coral/10 rounded-lg px-3 py-2">
                    <span className="text-sm text-coral">⚠️ Stock: {item.stock} — expiring soon</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-400">Add to Flash Sale?</span>
                      <button
                        onClick={() => toggleFlashSale(item.id)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${flashSaleActive[item.id] ? "bg-accent" : "bg-gray-700"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${flashSaleActive[item.id] ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — Waste Logger */}
        <div className="w-[40%] space-y-4">
          {/* Scan Button */}
          <button onClick={handleScan}
            className={`w-full py-6 rounded-xl bg-coral text-white font-medium text-lg flex items-center justify-center gap-3 transition-transform ${scanning ? "scale-95 opacity-80" : "hover:scale-[1.02]"}`}>
            <Camera size={24} />
            SCAN WASTE ITEM
          </button>

          {/* Manual Log */}
          <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-sm text-gray-400">Manual Log</h3>
            <div className="relative">
              <select value={logItem} onChange={(e) => setLogItem(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none pr-8">
                {prepItems.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Qty" value={logQty} onChange={(e) => setLogQty(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
              <select value={logUnit} onChange={(e) => setLogUnit(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <option>g</option><option>kg</option><option>portion</option>
              </select>
            </div>
            <div className="relative">
              <select value={logReason} onChange={(e) => setLogReason(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm appearance-none pr-8">
                <option>Over-prepped</option><option>Expired</option><option>Plate return</option><option>Damaged</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
            <button onClick={handleLogWaste} className="btn-primary w-full">Log Waste</button>
          </div>

          {/* Flash Sale Panel */}
          <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-sm text-gray-400">Near-Expiry Flash Sales</h3>
            {flashSales.map((fs) => (
              <div key={fs.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="font-medium text-sm">{fs.name} <span className="text-gray-500 text-xs">({fs.stock})</span></p>
                  <p className="text-sm">
                    <span className="line-through text-gray-500">₹{fs.originalPrice}</span>{" "}
                    <span className="text-mint font-medium">₹{fs.salePrice}</span>
                  </p>
                </div>
                <button
                  onClick={() => toggleFlashSale(fs.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${flashSaleActive[fs.id] ? "bg-mint/20 text-mint" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  {flashSaleActive[fs.id] ? "✓ ACTIVE" : "ACTIVATE"}
                </button>
              </div>
            ))}
          </div>

          {/* Recent Waste Log */}
          <div className="bg-gray-900/60 rounded-xl p-4 space-y-2">
            <h3 className="font-medium text-sm text-gray-400">Recent Waste Log</h3>
            {wasteLogs.slice(0, 5).map((log, i) => (
              <p key={i} className="text-xs text-gray-400">
                <span className="font-mono text-gray-500">{log.timestamp}</span> — {log.item}, {log.qty}{log.unit}, {log.reason}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
