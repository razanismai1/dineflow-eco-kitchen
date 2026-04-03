import { useState, useEffect, useRef } from "react";
import { Camera, ChevronDown, Plus, Minus } from "lucide-react";
import { prepItems, flashSales, initialOrderItems, OrderItem } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-gray-500">{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>;
}

const tagColors: Record<string, string> = {
  event: "bg-amber/20 text-amber",
  expiry: "bg-coral/20 text-coral",
  weather: "bg-steel/20 text-blue-400",
  peak: "bg-mint/20 text-mint",
};
export default function KitchenPanel() {
  const { flashSaleActive, toggleFlashSale, wasteLogs, addWasteLog } = useApp();
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);
  const handleUpdateItemStatus = (id: string, newStatus: OrderItem['status']) => {
    setOrderItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const activeItems = orderItems.filter(item => item.status !== 'done').sort((a, b) => a.createdAt - b.createdAt);

  const [localPrepItems, setLocalPrepItems] = useState(prepItems);
  const [logItem, setLogItem] = useState(prepItems[0].name);
  const [logQty, setLogQty] = useState("");
  const [logUnit, setLogUnit] = useState("g");
  const [logReason, setLogReason] = useState("Over-prepped");

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
    toast.success("Waste logged successfully");
  };

  const handleUpdatePrep = (id: number, increment: number) => {
    setLocalPrepItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPrepped = Math.max(0, item.prepped + increment);
          return { ...item, prepped: newPrepped };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <span className="font-display text-lg">🧑‍🍳 Kitchen Panel</span>
        <LiveClock />
        <span className="badge-pill bg-accent/20 text-mint text-xs">Service: LUNCH</span>
      </header>

      <div className="flex gap-6 p-6">
        {/* LEFT — Prep List */}
        <div className="w-[60%] space-y-4">
          
          {/* Order items queue */}
          <div className="space-y-4 mb-10">
            <h2 className="font-display text-xl">Live Orders (Item View)</h2>
            <div className="flex flex-col gap-3">
              {activeItems.length === 0 ? (
                <div className="text-gray-500 text-sm italic bg-gray-100 p-4 rounded-xl text-center border border-gray-200">No pending items.</div>
              ) : (
                activeItems.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border-l-[4px] bg-white shadow-sm transition-all ${item.status === 'preparing' ? 'border-accent' : 'border-gray-300'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">{item.orderId}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        {item.status === 'preparing' && (
                          <span className="badge-pill bg-accent/20 text-accent text-[10px] py-0.5 px-2">Preparing</span>
                        )}
                        {item.status === 'new' && (
                          <span className="badge-pill bg-gray-100 text-gray-600 border border-gray-200 text-[10px] py-0.5 px-2">New</span>
                        )}
                      </div>
                      <div className="font-medium text-lg text-gray-900">{item.name}</div>
                    </div>
                    <div>
                      {item.status === 'new' ? (
                        <button 
                          onClick={() => handleUpdateItemStatus(item.id, 'preparing')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 rounded-lg text-sm font-medium transition"
                        >
                          Prepare
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateItemStatus(item.id, 'done')}
                          className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg text-sm font-medium transition"
                        >
                          Mark as Done
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl">Today's Prep Sheet</h2>
            <span className="badge-pill bg-mint/20 text-mint text-xs">92% AI Accuracy</span>
          </div>
          {localPrepItems.map((item) => {
            const pct = Math.round((item.prepped / item.target) * 100);
            return (
              <div key={item.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-base text-gray-900">{item.name}</span>
                  {item.aiTag && (
                    <span className={`badge-pill text-xs ml-auto ${tagColors[item.aiTag.type] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                      {item.aiTag.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex gap-4">
                    <span>Target: <strong className="text-gray-900">{item.target}</strong></span>
                    <span>Usual: {item.usual}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Prepped:</span>
                    <button 
                      onClick={() => handleUpdatePrep(item.id, -1)}
                      className="p-1 bg-gray-100 text-gray-700 border border-gray-200 rounded hover:bg-gray-200 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <strong className="text-gray-900 min-w-[2ch] text-center">{item.prepped}</strong>
                    <button 
                      onClick={() => handleUpdatePrep(item.id, 1)}
                      className="p-1 bg-gray-100 text-gray-700 border border-gray-200 rounded hover:bg-gray-200 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? "bg-mint" : pct >= 50 ? "bg-accent" : "bg-amber"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                {item.expiryAlert && (
                  <div className="flex items-center justify-between bg-coral/10 rounded-lg px-3 py-2 mt-2">
                    <span className="text-sm text-coral">⚠️ Stock: {item.stock} — expiring soon</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-500">Add to Flash Sale?</span>
                      <button
                        onClick={() => toggleFlashSale(item.id)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${flashSaleActive[item.id] ? "bg-accent" : "bg-gray-300"}`}
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
          {/* Manual Log */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-sm text-gray-600">Manual Log</h3>
            <div className="relative">
              <select value={logItem} onChange={(e) => setLogItem(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm appearance-none pr-8">
                {localPrepItems.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Qty" value={logQty} onChange={(e) => setLogQty(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
              <select value={logUnit} onChange={(e) => setLogUnit(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                <option>g</option><option>kg</option><option>portion</option>
              </select>
            </div>
            <div className="relative">
              <select value={logReason} onChange={(e) => setLogReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm appearance-none pr-8">
                <option>Over-prepped</option><option>Expired</option><option>Plate return</option><option>Damaged</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={handleLogWaste} className="w-full py-2 bg-mint text-gray-900 rounded-lg font-medium hover:bg-mint/90 transition">
              Log Waste
            </button>
          </div>

          {/* Flash Sale Panel */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-sm text-gray-600">Near-Expiry Flash Sales</h3>
            {flashSales.map((fs) => (
              <div key={fs.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{fs.name} <span className="text-gray-500 text-xs">({fs.stock})</span></p>
                  <p className="text-sm">
                    <span className="line-through text-gray-400">₹{fs.originalPrice}</span>{" "}
                    <span className="text-mint font-medium">₹{fs.salePrice}</span>
                  </p>
                </div>
                <button
                  onClick={() => toggleFlashSale(fs.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${flashSaleActive[fs.id] ? "bg-mint/20 text-mint" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"}`}
                >
                  {flashSaleActive[fs.id] ? "✓ ACTIVE" : "ACTIVATE"}
                </button>
              </div>
            ))}
          </div>

          {/* Recent Waste Log */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 space-y-2">
            <h3 className="font-medium text-sm text-gray-600">Recent Waste Log</h3>
            {wasteLogs.length === 0 ? (
              <p className="text-xs text-gray-500">No waste logged today.</p>
            ) : (
              wasteLogs.slice(0, 5).map((log, i) => (
                <p key={i} className="text-xs text-gray-600">
                  <span className="font-mono text-gray-500">{log.timestamp}</span> — {log.item}, {log.qty}{log.unit}, {log.reason}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
