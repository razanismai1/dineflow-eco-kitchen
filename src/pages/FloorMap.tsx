import { useState } from "react";
import { Plus, Users, AlertCircle, X } from "lucide-react";
import { notifications as initialNotifications } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import type { TableData } from "@/data/mockData";

const statusConfig: Record<string, { bg: string; label: (t: TableData) => string }> = {
  available: { bg: "bg-[#74C69D]/20", label: () => "Available" },
  occupied: { bg: "bg-[#F4A261]/20", label: (t) => `${t.timeSeated} min` },
  preorder: { bg: "bg-[#457B9D]/20", label: (t) => `ETA ${t.eta}min` },
  reserved: { bg: "bg-[#E76F51]/20", label: (t) => t.reservationTime || "Reserved" },
  cleaning: { bg: "bg-[#8A8A7A]/20", label: () => "Cleaning" },
};

const legendItems = [
  { color: "#74C69D", label: "Available" },
  { color: "#F4A261", label: "Occupied" },
  { color: "#457B9D", label: "Pre-order" },
  { color: "#E76F51", label: "Reserved" },
  { color: "#8A8A7A", label: "Cleaning" },
];

export default function FloorMap() {
  const { tablesState, setTablesState, resetAllTables } = useApp();
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [alerts, setAlerts] = useState(initialNotifications);

  const dismissAlert = (id: number) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const markAvailable = (id: string) => {
    setTablesState((prev) => prev.map((t) => (t.id === id ? { ...t, status: "available" as const, timeSeated: undefined, course: undefined, guestName: undefined, eta: undefined, distanceMeters: undefined, reservationTime: undefined } : t)));
    setSelectedTable(null);
    toast.success(`${id} marked available`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <span className="font-display text-lg">🍽️ Floor Manager</span>
        <span className="badge-pill bg-accent/15 text-accent text-xs">Lunch Service</span>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => toast.info("New order (demo)")}>
          <Plus size={16} /> New Order
        </button>
      </header>

      <div className="flex gap-6 p-6">
        {/* Table Grid */}
        <div className="w-[70%]">
          <div className="grid grid-cols-5 gap-3">
            {tablesState.map((table) => {
              const cfg = statusConfig[table.status];
              return (
                <button key={table.id} onClick={() => setSelectedTable(table)}
                  className={`${cfg.bg} rounded-xl p-3 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 relative ${table.status === "preorder" ? "animate-pulse-ring" : ""}`}>
                  <p className="font-mono font-bold text-sm">{table.id}</p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Users size={12} /> {table.capacity}
                  </p>
                  <p className="text-xs font-medium mt-1">{cfg.label(table)}</p>
                  {table.guestName && <p className="text-xs text-muted-foreground truncate">{table.guestName}</p>}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 justify-center">
            {legendItems.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="w-[30%] space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg">Live Alerts</h2>
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          </div>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="card-dineflow p-3 animate-slide-in-right" style={{ borderLeft: `4px solid ${a.color}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: a.color }}>{a.title}</p>
                    <p className="text-sm mt-1">{a.message}</p>
                  </div>
                  <button onClick={() => dismissAlert(a.id)} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>
                <button className="btn-primary text-xs px-2 py-1 mt-2" onClick={() => { dismissAlert(a.id); toast.success(`${a.action} done`); }}>
                  {a.action}
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4">
            <button className="w-full py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors" onClick={() => { resetAllTables(); toast.success("All tables reset"); }}>
              All Tables Available
            </button>
            <button className="w-full py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors" onClick={() => toast.info("New service started (demo)")}>
              New Service
            </button>
          </div>
        </div>
      </div>

      {/* Table Detail Sheet */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSelectedTable(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-6 animate-slide-up space-y-4" onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease-out" }}>
            <div className="w-12 h-1 bg-border rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">{selectedTable.id}</h3>
              <span className="badge-pill bg-muted text-muted-foreground"><Users size={12} className="mr-1" />{selectedTable.capacity} seats</span>
            </div>
            {selectedTable.guestName && <p className="text-sm">Guest: <strong>{selectedTable.guestName}</strong></p>}
            <p className="text-sm capitalize">Status: <strong>{selectedTable.status}</strong></p>
            {selectedTable.timeSeated && <p className="text-sm">Time seated: <strong>{selectedTable.timeSeated} min</strong> (Course {selectedTable.course})</p>}
            {selectedTable.eta && <p className="text-sm">ETA: <strong>{selectedTable.eta} min</strong> ({selectedTable.distanceMeters}m away)</p>}
            {selectedTable.reservationTime && <p className="text-sm">Reserved for: <strong>{selectedTable.reservationTime}</strong></p>}
            {selectedTable.preOrderItems && (
              <div>
                <p className="text-sm font-medium mb-1">Pre-order items:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {selectedTable.preOrderItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1" onClick={() => markAvailable(selectedTable.id)}>Mark Available</button>
              <button className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                onClick={() => { toast.warning("Issue flagged (demo)"); setSelectedTable(null); }}>
                <AlertCircle size={14} className="inline mr-1" /> Flag Issue
              </button>
            </div>
          </div>
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
}
