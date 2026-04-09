import { useState, useEffect } from "react";
import { Plus, Minus, Zap, ClipboardList, CheckCircle2, Clock, ChefHat, LogOut } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useInventoryItems } from "@/hooks/useInventory";
import { useFlashSales } from "@/hooks/useMenu";

type KitchenOrderItem = {
  id: string;
  orderPk: number;
  orderId: string;
  name: string;
  status: "new" | "preparing" | "done";
  createdAt: number;
};

type PrepItem = {
  id: number;
  name: string;
  icon: string;
  target: number;
  usual: number;
  prepped: number;
  aiTag: { type: string; label: string; color: string } | null;
  expiryAlert?: boolean;
  stock?: string;
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm text-muted-foreground tabular-nums">
      {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

const tagColors: Record<string, string> = {
  event:   "bg-amber/15 text-amber border border-amber/25",
  expiry:  "bg-coral/15 text-coral border border-coral/25",
  weather: "bg-steel/15 text-steel border border-steel/25",
  peak:    "bg-mint/15 text-mint border border-mint/25",
};

function StatusBadge({ status }: { status: KitchenOrderItem["status"] }) {
  if (status === "preparing")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-coral/15 text-coral border border-coral/20">
        <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
        Preparing
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
      <Clock size={9} />
      Queued
    </span>
  );
}

function OrderCard({ item, onAction }: { item: KitchenOrderItem; onAction: () => void }) {
  const isPreparing = item.status === "preparing";
  return (
    <div
      className={`card-dineflow flex items-center justify-between px-4 py-3 border-l-4 transition-all duration-200 ${
        isPreparing ? "border-coral/50" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{item.orderId}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <span className="font-semibold text-foreground text-base truncate">{item.name}</span>
      </div>
      <button
        onClick={onAction}
        className={`shrink-0 ml-4 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          isPreparing
            ? "bg-mint text-accent-foreground hover:opacity-90 shadow-sm"
            : "bg-muted hover:bg-muted/80 text-foreground border border-border"
        }`}
      >
        {isPreparing ? "✓ Done" : "Prepare"}
      </button>
    </div>
  );
}

export default function KitchenPanel() {
  const { flashSaleActive, toggleFlashSale, userRole, setUserRole } = useApp();
  const navigate = useNavigate();
  const { data: rawOrders = [] } = useOrders();
  const { data: rawInventory = [] } = useInventoryItems();
  const { data: rawFlashSales = [] } = useFlashSales();
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();
  const [orderItems, setOrderItems] = useState<KitchenOrderItem[]>([]);
  const [localPrepItems, setLocalPrepItems] = useState<PrepItem[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "prep">("orders");

  useEffect(() => {
    if (!Array.isArray(rawOrders)) return;
    const mapped: KitchenOrderItem[] = rawOrders.map((order: any) => {
      const label = Array.isArray(order.items) && order.items.length > 0
        ? order.items.map((item: any) => item.name || `Item ${item.id}`).join(", ")
        : "Order";
      const statusMap: Record<string, KitchenOrderItem["status"]> = {
        queued: "new",
        preparing: "preparing",
        done: "done",
      };
      return {
        id: `order-${order.id}`,
        orderPk: Number(order.id),
        orderId: `#${order.id}`,
        name: label,
        status: statusMap[order.status] || "new",
        createdAt: new Date(order.created_at || Date.now()).getTime(),
      };
    });
    setOrderItems(mapped);
  }, [rawOrders]);

  useEffect(() => {
    if (!Array.isArray(rawInventory)) return;
    const mapped: PrepItem[] = rawInventory.map((item: any) => {
      const quantity = Number(item.quantity ?? 0);
      const target = Math.max(1, Math.round(quantity * 1.1));
      return {
        id: item.id,
        name: item.name,
        icon: "🍽️",
        target,
        usual: quantity,
        prepped: quantity,
        aiTag: null,
        expiryAlert: false,
      };
    });
    setLocalPrepItems(mapped);
  }, [rawInventory]);

  const flashSales = Array.isArray(rawFlashSales)
    ? rawFlashSales.map((fs: any) => ({
        id: fs.id,
        name: fs.menu_item_name || `Sale ${fs.id}`,
        originalPrice: Number(fs.menu_item_base_price ?? 0),
        salePrice: Math.max(0, Math.round(Number(fs.menu_item_base_price ?? 0) * (100 - Number(fs.discount_percentage ?? 0)) / 100)),
        stock: "Active",
      }))
    : [];

  const handleLogout = () => { setUserRole(null); navigate("/"); };

  const handleUpdateItemStatus = (id: string, newStatus: KitchenOrderItem["status"]) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    const order = orderItems.find((item) => item.id === id);
    if (order) {
      const statusMap: Record<KitchenOrderItem["status"], string> = {
        new: "queued",
        preparing: "preparing",
        done: "done",
      };
      updateOrderStatus({ id: order.orderPk, status: statusMap[newStatus] });
    }
  };

  const handleUpdatePrep = (id: number, increment: number) => {
    setLocalPrepItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, prepped: Math.max(0, item.prepped + increment) };
        }
        return item;
      })
    );
  };

  const newItems = orderItems.filter((i) => i.status === "new").sort((a, b) => a.createdAt - b.createdAt);
  const preparingItems = orderItems.filter((i) => i.status === "preparing").sort((a, b) => a.createdAt - b.createdAt);
  const activeItems = [...preparingItems, ...newItems];
  const flashSaleCount = Object.values(flashSaleActive).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
            <ChefHat size={18} className="text-coral" />
          </div>
          <span className="font-display font-semibold text-base">Kitchen Panel</span>
        </div>
        <LiveClock />
        <div className="flex items-center gap-3">
          <span className="badge-pill bg-mint/15 text-mint border border-mint/20 text-xs">
            🍽 LUNCH SERVICE
          </span>
          {userRole !== "admin" && (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-coral hover:bg-coral/10 border border-border transition-all"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* ── Summary bar ── */}
      <div className="grid grid-cols-4 gap-3 px-6 py-3 bg-card border-b border-border/50">
        <div className="flex items-center gap-2 bg-coral/8 border border-coral/15 rounded-xl px-3 py-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-[11px] text-coral font-medium">Preparing</p>
            <p className="font-bold text-coral text-lg leading-none">{preparingItems.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl px-3 py-2">
          <span className="text-lg">📋</span>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Queued</p>
            <p className="font-bold text-foreground text-lg leading-none">{newItems.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-mint/8 border border-mint/15 rounded-xl px-3 py-2">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-[11px] text-mint font-medium">Done Today</p>
            <p className="font-bold text-mint text-lg leading-none">
              {orderItems.filter((i) => {
                if (i.status !== "done") return false;
                const d = new Date(i.createdAt);
                const today = new Date();
                return d.getDate() === today.getDate() &&
                       d.getMonth() === today.getMonth() &&
                       d.getFullYear() === today.getFullYear();
              }).length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-accent/8 border border-accent/15 rounded-xl px-3 py-2">
          <Zap size={15} className="text-accent" />
          <div>
            <p className="text-[11px] text-accent font-medium">Flash Sales</p>
            <p className="font-bold text-accent text-lg leading-none">{flashSaleCount}</p>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex gap-5 p-5 h-[calc(100vh-190px)] min-h-0">

        {/* LEFT COLUMN — Orders + Prep Sheet (tabbed) */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex gap-1 bg-muted p-1 rounded-xl mb-4 shrink-0">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "orders"
                  ? "bg-card shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardList size={14} />
              Live Orders
              {activeItems.length > 0 && (
                <span className="ml-1 bg-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("prep")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "prep"
                  ? "bg-card shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 size={14} />
              Prep Sheet
              <span className="ml-1 text-[10px] text-mint font-semibold bg-mint/10 px-1.5 py-0.5 rounded-full border border-mint/20">
                92% AI
              </span>
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeTab === "orders" && (
              <>
                {preparingItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-coral uppercase tracking-wider mb-2">
                      🔥 Now Preparing ({preparingItems.length})
                    </p>
                    <div className="space-y-2">
                      {preparingItems.map((item) => (
                        <OrderCard
                          key={item.id}
                          item={item}
                          onAction={() => handleUpdateItemStatus(item.id, "done")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {newItems.length > 0 && (
                  <div className={preparingItems.length > 0 ? "mt-4" : ""}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      📋 Up Next ({newItems.length})
                    </p>
                    <div className="space-y-2">
                      {newItems.map((item) => (
                        <OrderCard
                          key={item.id}
                          item={item}
                          onAction={() => handleUpdateItemStatus(item.id, "preparing")}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-5xl mb-3">🎉</span>
                    <p className="font-semibold text-foreground">All caught up!</p>
                    <p className="text-sm text-muted-foreground mt-1">No pending orders right now.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "prep" && (
              <div className="space-y-3">
                {localPrepItems.map((item) => {
                  const pct = Math.round((item.prepped / item.target) * 100);
                  const barColor = pct >= 90 ? "bg-mint" : pct >= 50 ? "bg-amber" : "bg-coral";
                  const pctColor = pct >= 90 ? "text-mint" : pct >= 50 ? "text-amber" : "text-coral";
                  return (
                    <div key={item.id} className="card-dineflow p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Usual: {item.usual} · Target: <strong className="text-foreground">{item.target}</strong>
                            </p>
                          </div>
                        </div>
                        {item.aiTag && (
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${tagColors[item.aiTag.type] || "bg-muted text-muted-foreground"}`}>
                            {item.aiTag.label}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${pctColor}`}>{pct}%</span>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prepped</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdatePrep(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center bg-muted text-foreground border border-border rounded-lg hover:bg-muted/80 transition"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-bold text-foreground text-base min-w-[2.5ch] text-center">{item.prepped}</span>
                          <button
                            onClick={() => handleUpdatePrep(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-muted text-foreground border border-border rounded-lg hover:bg-muted/80 transition"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expiry alert */}
                      {item.expiryAlert && (
                        <div className="flex items-center justify-between bg-coral/8 border border-coral/15 rounded-lg px-3 py-2">
                          <span className="text-xs text-coral font-medium">⚠️ {item.stock} expiring soon</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Flash Sale?</span>
                            <button
                              onClick={() => toggleFlashSale(item.id)}
                              className={`w-10 h-5 rounded-full relative transition-colors ${
                                flashSaleActive[item.id] ? "bg-mint" : "bg-border"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  flashSaleActive[item.id] ? "translate-x-5" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Flash Sales */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <div className="card-dineflow overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent/5">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-accent" />
                <h3 className="font-semibold text-sm text-foreground">Near-Expiry Flash Sales</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{flashSales.length} items</span>
            </div>
            <div className="divide-y divide-border">
              {flashSales.map((fs) => (
                <div key={fs.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{fs.name}</p>
                    <p className="text-xs text-muted-foreground">{fs.stock}</p>
                    <p className="text-sm mt-0.5">
                      <span className="line-through text-muted-foreground text-xs">₹{fs.originalPrice}</span>{" "}
                      <span className="text-mint font-bold">₹{fs.salePrice}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFlashSale(fs.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${
                      flashSaleActive[fs.id]
                        ? "bg-mint/10 text-mint border-mint/25"
                        : "bg-transparent text-muted-foreground border-border hover:bg-accent/8 hover:text-accent hover:border-accent/20"
                    }`}
                  >
                    {flashSaleActive[fs.id] ? "✓ Active" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tip card */}
          <div className="card-dineflow p-4 bg-amber/5 border border-amber/15">
            <p className="text-xs font-semibold text-amber mb-1">💡 AI Tip</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Weekend peak hours incoming — consider prepping Gulab Jamun 40% above usual target.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
