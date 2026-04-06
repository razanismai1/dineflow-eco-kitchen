import { useEffect, useMemo, useState } from "react";
import { Plus, Minus, Users, AlertCircle, X, LogOut, ShoppingBag, ChevronDown } from "lucide-react";
import { useApp, type TableData } from "@/contexts/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAlerts, useDismissAlert, useTables, useUpdateTableStatus } from "@/hooks/useFloor";
import { useCategories, useMenuItems } from "@/hooks/useMenu";

const statusConfig: Record<string, { bg: string; label: (t: TableData) => string }> = {
  available: { bg: "bg-[#74C69D]/20", label: () => "Available" },
  occupied:  { bg: "bg-[#F4A261]/20", label: (t) => `${t.timeSeated} min` },
  preorder:  { bg: "bg-[#457B9D]/20", label: (t) => `ETA ${t.eta}min` },
  reserved:  { bg: "bg-[#E76F51]/20", label: (t) => t.reservationTime || "Reserved" },
  cleaning:  { bg: "bg-[#8A8A7A]/20", label: () => "Cleaning" },
};

const legendItems = [
  { color: "#74C69D", label: "Available" },
  { color: "#F4A261", label: "Occupied" },
  { color: "#457B9D", label: "Pre-order" },
  { color: "#E76F51", label: "Reserved" },
  { color: "#8A8A7A", label: "Cleaning" },
];

/* ─── New Order Modal ─────────────────────────────────────────────────────── */
interface CartEntry { id: number; name: string; price: number; qty: number; }

function NewOrderModal({ tables, categories, menuItems, onClose, onPlace }: {
  tables: TableData[];
  categories: Array<{ id: number; name: string }>;
  menuItems: Array<{ id: number; name: string; price: number; veg: boolean; desc: string; categoryId: number }>;
  onClose: () => void;
  onPlace: (tableId: string, items: CartEntry[]) => void;
}) {
  const [tableId, setTableId] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || "");
  const [cart, setCart] = useState<CartEntry[]>([]);

  const addItem = (item: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) return prev.map((e) => e.id === item.id ? { ...e, qty: e.qty + 1 } : e);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((e) => e.id !== id);
      return prev.map((e) => e.id === id ? { ...e, qty: e.qty - 1 } : e);
    });
  };

  const totalItems = cart.reduce((s, e) => s + e.qty, 0);
  const totalPrice = cart.reduce((s, e) => s + e.qty * e.price, 0);

  const handlePlace = () => {
    if (!tableId) { toast.error("Please select a table"); return; }
    if (cart.length === 0) { toast.error("Add at least one item"); return; }
    onPlace(tableId, cart);
  };

  const catItems = menuItems.filter((item) => {
    const category = categories.find((c) => c.id === item.categoryId);
    return category?.name === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}>
      <div
        className="frosted-glass w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh", animation: "slideUp 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <ShoppingBag size={16} className="text-accent" />
            </div>
            <h2 className="font-display text-base font-semibold">New Order</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* ── Table Selector ── */}
        <div className="px-5 pt-4 pb-3 border-b border-border/40">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Select Table</label>
          <div className="relative">
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            >
              <option value="">— Choose a table —</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id} disabled={t.status !== "available"}>
                  {t.id} · {t.capacity} seats
                  {t.status !== "available" ? ` (${t.status})` : " · Available"}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-1 px-5 pt-3 pb-2 border-b border-border/40 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.name
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Menu Items ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {catItems.map((item) => {
            const inCart = cart.find((e) => e.id === item.id);
            return (
              <div key={item.id} className="flex items-center justify-between card-dineflow px-4 py-3 rounded-xl">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.veg ? "bg-mint" : "bg-coral"}`} />
                    <p className="text-sm font-medium truncate">{item.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.desc}</p>
                  <p className="text-xs font-semibold mt-0.5 text-accent">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {inCart ? (
                    <>
                      <button onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-colors">
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{inCart.qty}</span>
                      <button onClick={() => addItem(item)}
                        className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                        <Plus size={13} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => addItem(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold hover:bg-accent hover:text-accent-foreground transition-all">
                      <Plus size={12} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order Summary Footer ── */}
        <div className="border-t border-border/60 px-5 py-4 bg-card/80 space-y-3">
          {cart.length > 0 && (
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {cart.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1">{e.name} <span className="text-foreground font-medium">×{e.qty}</span></span>
                  <span className="font-semibold ml-3 shrink-0">₹{e.qty * e.price}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              <p className="text-lg font-bold">₹{totalPrice}</p>
            </div>
            <button
              onClick={handlePlace}
              disabled={!tableId || cart.length === 0}
              className="btn-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Place Order →
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function FloorMap() {
  const { tablesState, setTablesState, resetAllTables, userRole, setUserRole } = useApp();
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const { data: rawTables = [] } = useTables();
  const { data: rawAlerts = [] } = useAlerts();
  const { mutate: dismissAlertApi } = useDismissAlert();
  const { mutate: updateTableStatus } = useUpdateTableStatus();
  const { data: rawCategories = [] } = useCategories();
  const { data: rawMenuItems = [] } = useMenuItems();

  const menuCategories = useMemo(
    () => (Array.isArray(rawCategories) ? rawCategories.map((c: any) => ({ id: c.id, name: c.name })) : []),
    [rawCategories]
  );
  const menuItems = useMemo(
    () => (Array.isArray(rawMenuItems)
      ? rawMenuItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price ?? item.base_price ?? 0),
          veg: !!item.is_vegan,
          desc: item.description || "",
          categoryId: item.category,
        }))
      : []),
    [rawMenuItems]
  );

  const alerts = useMemo(() => {
    if (!Array.isArray(rawAlerts)) return [];
    return rawAlerts.map((a: any) => {
      const type = a.type || 'table';
      const colorMap: Record<string, string> = {
        preorder: '#457B9D',
        table: '#F4A261',
        ready: '#74C69D',
        complaint: '#E76F51',
        assistance: '#E76F51',
        payment: '#74C69D',
        issue: '#E76F51',
      };
      return {
        id: a.id,
        type,
        color: colorMap[type] || '#457B9D',
        title: (a.type || 'alert').toUpperCase(),
        message: a.message || 'Alert',
        action: 'Acknowledge',
      };
    });
  }, [rawAlerts]);

  useEffect(() => {
    if (!Array.isArray(rawTables)) return;
    const mapped: TableData[] = rawTables.map((table: any) => ({
      id: table.name || `T-${table.id}`,
      pk: table.id,
      capacity: table.capacity ?? 0,
      status: table.status === 'pre-order' ? 'preorder' : table.status,
      timeSeated: table.time_seated ? Math.max(0, Math.floor((Date.now() - new Date(table.time_seated).getTime()) / 60000)) : undefined,
      reservationTime: undefined,
    }));
    setTablesState(mapped);
  }, [rawTables, setTablesState]);

  const handleLogout = () => { setUserRole(null); navigate("/"); };
  const dismissAlert = (id: number) => dismissAlertApi(id);

  const markAvailable = (id: string) => {
    const selected = tablesState.find((t) => t.id === id);
    if (selected?.pk != null) {
      updateTableStatus({ id: selected.pk, status: 'available' });
    }
    setTablesState((prev) => prev.map((t) => (t.id === id ? { ...t, status: "available" as const, timeSeated: undefined, course: undefined, guestName: undefined, eta: undefined, distanceMeters: undefined, reservationTime: undefined } : t)));
    setSelectedTable(null);
    toast.success(`${id} marked available`);
  };

  const handlePlaceOrder = (tableId: string, items: { id: number; name: string; price: number; qty: number }[]) => {
    setTablesState((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "occupied" as const, timeSeated: 0, course: 1 }
          : t
      )
    );
    const names = items.map((i) => `${i.name} ×${i.qty}`).join(", ");
    toast.success(`Order placed for ${tableId}`, { description: names });
    setShowNewOrder(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-steel/10 flex items-center justify-center">
            <span className="text-lg">🍽️</span>
          </div>
          <div>
            <h1 className="font-display text-lg leading-tight">Floor Manager</h1>
            <span className="badge-pill bg-accent/10 text-accent text-xs">Lunch Service</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-primary flex items-center gap-1.5 text-sm"
            onClick={() => setShowNewOrder(true)}
          >
            <Plus size={16} /> New Order
          </button>
          {userRole !== "admin" && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-coral hover:bg-coral/10 border border-border transition-all"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          )}
        </div>
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
            <span className="badge-pill bg-mint/15 text-mint text-[10px]">
              {alerts.length}
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-mint inline-block animate-pulse" />
            </span>
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
                <button className="btn-primary text-xs px-2 py-1 mt-2"
                  onClick={() => { dismissAlert(a.id); toast.success(`${a.action} done`); }}>
                  {a.action}
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4">
            <button className="w-full py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              onClick={() => { resetAllTables(); toast.success("All tables reset"); }}>
              All Tables Available
            </button>
            <button className="w-full py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              onClick={() => toast.info("New service started (demo)")}>
              New Service
            </button>
          </div>
        </div>
      </div>

      {/* Table Detail Sheet */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={() => setSelectedTable(null)}>
          <div className="frosted-glass w-full max-w-lg rounded-t-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease-out" }}>
            <div className="w-12 h-1 bg-border rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">{selectedTable.id}</h3>
              <span className="badge-pill bg-muted text-muted-foreground"><Users size={12} className="mr-1" />{selectedTable.capacity} seats</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {selectedTable.guestName && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Guest</p>
                  <p className="font-semibold">{selectedTable.guestName}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Status</p>
                <p className="font-semibold capitalize">{selectedTable.status}</p>
              </div>
              {selectedTable.timeSeated !== undefined && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Time Seated</p>
                  <p className="font-semibold">{selectedTable.timeSeated} min (Course {selectedTable.course})</p>
                </div>
              )}
              {selectedTable.eta && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">ETA</p>
                  <p className="font-semibold">{selectedTable.eta} min ({selectedTable.distanceMeters}m away)</p>
                </div>
              )}
              {selectedTable.reservationTime && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Reserved For</p>
                  <p className="font-semibold">{selectedTable.reservationTime}</p>
                </div>
              )}
            </div>
            {selectedTable.preOrderItems && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Pre-order items:</p>
                <ul className="text-sm text-foreground list-disc list-inside space-y-0.5">
                  {selectedTable.preOrderItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button className="btn-primary flex-1" onClick={() => {
                setSelectedTable(null);
                setShowNewOrder(true);
              }}>
                + Add Order
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                onClick={() => markAvailable(selectedTable.id)}>
                Mark Available
              </button>
              <button className="btn-danger flex-1"
                onClick={() => { toast.warning("Issue flagged (demo)"); setSelectedTable(null); }}>
                <AlertCircle size={14} className="inline mr-1" /> Flag Issue
              </button>
            </div>
          </div>
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrder && (
        <NewOrderModal
          tables={tablesState}
          categories={menuCategories}
          menuItems={menuItems}
          onClose={() => setShowNewOrder(false)}
          onPlace={handlePlaceOrder}
        />
      )}
    </div>
  );
}
