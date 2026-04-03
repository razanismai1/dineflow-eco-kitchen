import { useState } from "react";
import { ChevronDown, Trash2, ClipboardList, TrendingDown, AlertTriangle } from "lucide-react";
import { prepItems } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const REASON_OPTIONS = ["Over-prepped", "Expired", "Plate return", "Damaged"];
const UNIT_OPTIONS = ["g", "kg", "portion", "pcs", "L"];

const reasonIcons: Record<string, string> = {
  "Over-prepped": "📦",
  "Expired": "⏰",
  "Plate return": "🍽️",
  "Damaged": "💥",
};

export default function WasteManagement() {
  const { wasteLogs, addWasteLog } = useApp();

  const [logItem, setLogItem] = useState(prepItems[0].name);
  const [logQty, setLogQty] = useState("");
  const [logUnit, setLogUnit] = useState("g");
  const [logReason, setLogReason] = useState(REASON_OPTIONS[0]);

  const handleLogWaste = () => {
    if (!logQty || Number(logQty) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
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

  const totalEntries = wasteLogs.length;
  const reasonCounts = wasteLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.reason] = (acc[log.reason] || 0) + 1;
    return acc;
  }, {});
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-coral/10 flex items-center justify-center">
            <span className="text-lg">♻️</span>
          </div>
          <div>
            <h1 className="font-display text-lg leading-tight">Waste Management</h1>
            <p className="text-xs text-muted-foreground">Log & track food waste</p>
          </div>
        </div>
        <span className="badge-pill bg-mint/15 text-mint border border-mint/20 text-xs px-3 py-1">
          {totalEntries} entries today
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Stats Row — with color stripe */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-dineflow-stripe stat-stripe-coral p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center">
              <Trash2 size={18} className="text-coral" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Logs</p>
              <p className="text-xl font-bold text-foreground">{totalEntries}</p>
            </div>
          </div>
          <div className="card-dineflow-stripe stat-stripe-amber p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber/10 rounded-xl flex items-center justify-center">
              <AlertTriangle size={18} className="text-amber" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Top Reason</p>
              <p className="text-base font-semibold text-foreground">{topReason}</p>
            </div>
          </div>
          <div className="card-dineflow-stripe stat-stripe-mint p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-mint/10 rounded-xl flex items-center justify-center">
              <TrendingDown size={18} className="text-mint" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Items Tracked</p>
              <p className="text-xl font-bold text-foreground">{new Set(wasteLogs.map(l => l.item)).size}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Manual Log Form */}
          <div className="flex-1 card-dineflow p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-sm text-foreground">Log New Waste Entry</h2>
            </div>

            {/* Item selector */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Item</label>
              <div className="relative">
                <select
                  value={logItem}
                  onChange={(e) => setLogItem(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                >
                  {prepItems.map((p) => (
                    <option key={p.id} value={p.name}>{p.icon} {p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Qty + Unit */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Quantity & Unit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={logQty}
                  onChange={(e) => setLogQty(e.target.value)}
                  className="flex-1 bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                />
                <div className="relative">
                  <select
                    value={logUnit}
                    onChange={(e) => setLogUnit(e.target.value)}
                    className="bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  >
                    {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Reason — chip toggles */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Reason</label>
              <div className="grid grid-cols-2 gap-2">
                {REASON_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setLogReason(r)}
                    className={`chip-toggle ${logReason === r ? "chip-toggle-active" : "chip-toggle-inactive"}`}
                  >
                    <span>{reasonIcons[r]}</span>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogWaste}
              className="w-full btn-primary py-2.5 font-semibold flex items-center justify-center gap-2"
            >
              ✓ Log Waste Entry
            </button>
          </div>

          {/* Waste Log Feed */}
          <div className="flex-1 card-dineflow p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-semibold text-sm text-foreground">Waste Log Feed</h2>
              <span className="badge-pill bg-muted text-muted-foreground">{wasteLogs.length} records</span>
            </div>

            {wasteLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-4xl mb-3">📋</span>
                <p className="text-sm text-muted-foreground">No waste logged yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Use the form to log the first entry.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {wasteLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center border border-border shadow-sm shrink-0 mt-0.5">
                      <span className="text-sm">{reasonIcons[log.reason] ?? "🗑️"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-foreground truncate">{log.item}</p>
                        <span className="font-mono text-xs text-muted-foreground ml-2 shrink-0">{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-foreground/80 font-medium">{log.qty} {log.unit}</span>
                        <span className="text-border">·</span>
                        <span className="text-xs text-muted-foreground">{log.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
