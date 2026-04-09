import { useState, useEffect } from "react";
import { ChevronDown, Trash2, ClipboardList, TrendingDown, AlertTriangle } from "lucide-react";
import { useInventoryItems, useInventoryLogs, useCreateWasteLog } from "@/hooks/useInventory";
import { useMenuItems } from "@/hooks/useMenu";
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
  const { data: inventoryItems = [] } = useInventoryItems();
  const { data: menuItems = [] } = useMenuItems();
  const { data: rawLogs = [], isLoading: logsLoading } = useInventoryLogs();
  const { mutate: createLog } = useCreateWasteLog();

  const itemOptions = [
    ...(Array.isArray(inventoryItems) ? inventoryItems.map((i: any) => ({ 
      id: i.id, label: `${i.name} (Inv)`, type: 'inv' 
    })) : []),
    ...(Array.isArray(menuItems) ? menuItems.map((m: any) => ({ 
      id: m.id, label: `${m.name} (Menu)`, type: 'menu' 
    })) : [])
  ];

  const [selectedOptionLabel, setSelectedOptionLabel] = useState("");
  const [logQty, setLogQty] = useState("");
  const [logUnit, setLogUnit] = useState("g");
  const [logReason, setLogReason] = useState(REASON_OPTIONS[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (itemOptions.length > 0 && !selectedOptionLabel) {
      setSelectedOptionLabel(itemOptions[0].label);
    }
  }, [itemOptions, selectedOptionLabel]);

  const handleLogWaste = () => {
    if (!logQty || Number(logQty) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    const option = itemOptions.find(o => o.label === selectedOptionLabel);
    if (!option) {
      toast.error("Please select an item");
      return;
    }

    const reasonMap: Record<string, string> = {
      "Over-prepped": "over-prepped",
      "Expired": "expired",
      "Plate return": "plate-return",
      "Damaged": "damaged",
    };

    createLog({
      inventory_item: option.type === 'inv' ? option.id : null,
      menu_item: option.type === 'menu' ? option.id : null,
      quantity: Number(logQty),
      unit: logUnit,
      reason: reasonMap[logReason] || "damaged",
      notes: notes
    }, {
      onSuccess: () => {
        setLogQty("");
        setNotes("");
        toast.success("Waste logged successfully");
      },
      onError: () => {
        toast.error("Failed to log waste. Please try again.");
      }
    });
  };

  const wasteLogs = rawLogs.map((log: any) => {
    const reasonReverseMap: Record<string, string> = {
      "over-prepped": "Over-prepped",
      "expired": "Expired",
      "plate-return": "Plate return",
      "damaged": "Damaged",
    };
    return {
      timestamp: new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      item: log.inventory_item_name || log.menu_item_name || "Unknown Item",
      qty: log.quantity,
      unit: log.unit,
      reason: reasonReverseMap[log.reason] || log.reason,
    };
  });

  const totalEntries = wasteLogs.length;
  const reasonCounts = wasteLogs.reduce<Record<string, number>>((acc: any, log: any) => {
    acc[log.reason] = (acc[log.reason] || 0) + 1;
    return acc;
  }, {});
  const topReason = Object.entries(reasonCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
            <span className="text-base">♻️</span>
          </div>
          <div>
            <h1 className="font-display text-base leading-tight">Waste Management</h1>
            <p className="text-[10px] text-muted-foreground">Log & track food waste</p>
          </div>
        </div>
        <span className="badge-pill bg-mint/15 text-mint border border-mint/20 text-[10px] px-2 py-0.5">
          {totalEntries} entries today
        </span>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col gap-4 overflow-hidden">

        {/* Stats Row — with color stripe */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="card-dineflow-stripe stat-stripe-coral p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center">
              <Trash2 size={14} className="text-coral" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Logs</p>
              <p className="text-lg font-bold text-foreground leading-none">{totalEntries}</p>
            </div>
          </div>
          <div className="card-dineflow-stripe stat-stripe-amber p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber/10 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Top Reason</p>
              <p className="text-sm font-semibold text-foreground leading-none truncate">{topReason}</p>
            </div>
          </div>
          <div className="card-dineflow-stripe stat-stripe-mint p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-mint/10 rounded-lg flex items-center justify-center">
              <TrendingDown size={14} className="text-mint" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Items</p>
              <p className="text-lg font-bold text-foreground leading-none">{new Set(wasteLogs.map(l => l.item)).size}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">

          {/* Manual Log Form */}
          <div className="flex-1 card-dineflow p-4 space-y-3 overflow-y-auto scrollbar-hide">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={16} className="text-muted-foreground" />
              <h2 className="font-semibold text-sm text-foreground">Log New Waste Entry</h2>
            </div>

            {/* Item selector */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Item</label>
              <div className="relative">
                <select
                  value={selectedOptionLabel}
                  onChange={(e) => setSelectedOptionLabel(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                >
                  {itemOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Qty + Unit */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Quantity & Unit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={logQty}
                  onChange={(e) => setLogQty(e.target.value)}
                  className="flex-1 bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                />
                <div className="relative">
                  <select
                    value={logUnit}
                    onChange={(e) => setLogUnit(e.target.value)}
                    className="bg-background border border-border text-foreground rounded-lg px-2 py-1.5 text-xs appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  >
                    {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-2 top-2.5 text-muted-foreground pointer-events-none" />
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

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground font-medium">Notes (Optional)</label>
              <textarea
                placeholder="Extra details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent transition-all min-h-[50px] resize-none"
              />
            </div>

            <button
              onClick={handleLogWaste}
              disabled={logsLoading}
              className="w-full btn-primary py-2.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              ✓ {logsLoading ? "Saving..." : "Log Waste Entry"}
            </button>
          </div>

          {/* Waste Log Feed */}
          <div className="flex-1 card-dineflow p-4 space-y-3 flex flex-col min-w-0 h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-semibold text-sm text-foreground">Waste Log Feed</h2>
              <span className="badge-pill bg-muted text-muted-foreground">{wasteLogs.length} records</span>
            </div>

            {wasteLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center opacity-40">
                <span className="text-3xl mb-2">📋</span>
                <p className="text-xs font-bold text-muted-foreground">No waste logged yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-dineflow">
                {wasteLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center border border-border shadow-sm shrink-0">
                      <span className="text-sm">{reasonIcons[log.reason] ?? "🗑️"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-foreground truncate">{log.item}</p>
                        <span className="font-mono text-[9px] text-muted-foreground ml-2 shrink-0">{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-foreground/80 font-bold">{log.qty} {log.unit}</span>
                        <span className="text-border">·</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{log.reason}</span>
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
