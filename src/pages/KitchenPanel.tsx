import { useState, useEffect } from "react";
import { Plus, Minus, Zap, ClipboardList, CheckCircle2, Clock, ChefHat, LogOut } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useInventoryItems } from "@/hooks/useInventory";
import { useFlashSales, useMenuItems } from "@/hooks/useMenu";

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
  const { data: rawMenuItems = [] } = useMenuItems();
  const { data: rawFlashSales = [] } = useFlashSales();
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();
  const [orderItems, setOrderItems] = useState<KitchenOrderItem[]>([]);
  const [localPrepItems, setLocalPrepItems] = useState<PrepItem[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "intelligence">("orders");

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
    if (!Array.isArray(rawMenuItems)) return;
    const mapped: PrepItem[] = rawMenuItems.map((item: any) => {
      // For menu items, "Target" represents the portions needed for the service.
      // We'll use a mock logic: eco_score * 5 as target, and a slightly lower value as prepped.
      const target = (item.eco_score ?? 5) * 4;
      const prepped = Math.floor(target * 0.8);
      return {
        id: item.id,
        name: item.name,
        icon: item.is_vegan ? "🥬" : "🍲",
        target,
        usual: Math.floor(target * 0.9),
        prepped,
        aiTag: item.eco_score >= 8 ? { type: "peak", label: "Popular AI", color: "mint" } : null,
        expiryAlert: false,
      };
    });
    setLocalPrepItems(mapped);
  }, [rawMenuItems]);

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
      <div className="px-6 py-4 h-[calc(100vh-190px)] min-h-0 overflow-hidden">
        
        {/* Page Switcher Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-2xl w-fit border border-border/50">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "orders"
                ? "bg-card shadow-lg text-foreground scale-[1.02] ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <ClipboardList size={18} className={activeTab === "orders" ? "text-coral" : ""} />
            Live Orders
            {activeItems.length > 0 && (
              <span className="ml-1 bg-coral text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                {activeItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("intelligence")}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "intelligence"
                ? "bg-card shadow-lg text-foreground scale-[1.02] ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Zap size={18} className={activeTab === "intelligence" ? "text-accent" : ""} />
            Kitchen Intelligence
            <span className="ml-1 text-[10px] text-mint font-bold bg-mint/15 px-1.5 py-0.5 rounded-full border border-mint/20">
              AI READY
            </span>
          </button>
        </div>

        {activeTab === "orders" ? (
          /* ─── PAGE 1: LIVE ORDERS (FULL WIDTH) ─── */
          <div className="grid grid-cols-2 gap-6 h-[calc(100%-80px)] overflow-hidden">
            {/* Column: Now Preparing */}
            <div className="flex flex-col gap-4 min-w-0 h-full">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-coral uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                  Currently Preparing
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                   {preparingItems.length} ACTIVE
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-dineflow pb-10">
                {preparingItems.map((item) => (
                  <OrderCard
                    key={item.id}
                    item={item}
                    onAction={() => handleUpdateItemStatus(item.id, "done")}
                  />
                ))}
                {preparingItems.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl opacity-40">
                    <p className="text-sm font-medium">No active prep</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column: Queued */}
            <div className="flex flex-col gap-4 min-w-0 h-full">
               <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted" />
                  Order Queue
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                   {newItems.length} PENDING
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-dineflow pb-10">
                {newItems.map((item) => (
                  <OrderCard
                    key={item.id}
                    item={item}
                    onAction={() => handleUpdateItemStatus(item.id, "preparing")}
                  />
                ))}
                {newItems.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl opacity-40">
                    <p className="text-sm font-medium">Queue is empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ─── PAGE 2: KITCHEN INTELLIGENCE (PREP + AI + FLASH) ─── */
          <div className="flex gap-6 h-[calc(100%-80px)] overflow-hidden">
            {/* Main Column: Prep Sheet */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-mint uppercase tracking-[0.2em]">Prep Progress Tracking</h3>
                <span className="text-[10px] text-muted-foreground italic">Based on historical lunch demand</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-dineflow pb-10">
                {localPrepItems.map((item) => {
                  const pct = Math.round((item.prepped / item.target) * 100);
                  const barColor = pct >= 90 ? "bg-mint" : pct >= 50 ? "bg-amber" : "bg-coral";
                  const pctColor = pct >= 90 ? "text-mint" : pct >= 50 ? "text-amber" : "text-coral";
                  return (
                    <div key={item.id} className="card-dineflow p-4 group hover:ring-1 hover:ring-accent/20 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">
                              Target Supply: <span className="text-foreground">{item.target} units</span>
                            </p>
                          </div>
                        </div>
                        <div className={`text-right ${pctColor}`}>
                          <p className="text-lg font-black leading-none">{pct}%</p>
                          <p className="text-[10px] font-bold uppercase tracking-tighter">Ready</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                           {item.aiTag && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${tagColors[item.aiTag.type]}`}>
                              {item.aiTag.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 bg-muted/60 p-1 rounded-xl border border-border/50">
                          <button
                            onClick={() => handleUpdatePrep(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-card text-foreground shadow-sm rounded-lg hover:bg-accent hover:text-white transition-all active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-mono font-bold text-sm min-w-[3ch] text-center">{item.prepped}</span>
                          <button
                            onClick={() => handleUpdatePrep(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-card text-foreground shadow-sm rounded-lg hover:bg-accent hover:text-white transition-all active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar: Insights & Flash Sales */}
            <div className="w-80 shrink-0 flex flex-col gap-4 h-full overflow-y-auto pb-10 pr-1 scrollbar-hide">
              
              {/* AI Showcase Card */}
              <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-accent/15 via-accent/5 to-card border border-accent/20 shadow-sm">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Zap size={60} />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">AI Strategic Forecast</p>
                  </div>
                  <h4 className="font-display font-bold text-lg leading-tight text-foreground">
                    "Weekend peak incoming — boost Gulab Jamun prep by 40%."
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Analyzing historical table turnovers and current humidity levels for optimal storage.
                  </p>
                  <div className="pt-2">
                    <button className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1">
                      View full demand report →
                    </button>
                  </div>
                </div>
              </div>

              {/* Flash Sales Section */}
              <div className="card-dineflow overflow-hidden flex flex-col border border-coral/20">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-coral/5">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-coral" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Near-Expiry Actions</h3>
                  </div>
                  <span className="text-[10px] font-black text-coral bg-coral/10 px-2 py-0.5 rounded-full">
                    {flashSales.length} ITEMS
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {flashSales.length === 0 ? (
                    <div className="p-8 text-center opacity-40">
                      <p className="text-xs">No items currently at risk</p>
                    </div>
                  ) : (
                    flashSales.map((fs) => (
                      <div key={fs.id} className="group p-5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{fs.name}</p>
                            <p className="text-[10px] text-coral font-medium flex items-center gap-1">
                              <Clock size={10} /> Expiring in ~4 hours
                            </p>
                            <p className="text-sm pt-2 flex items-center gap-2">
                              <span className="line-through text-muted-foreground text-xs opacity-50 font-mono">₹{fs.originalPrice}</span>
                              <span className="text-mint font-black font-mono">₹{fs.salePrice}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => toggleFlashSale(fs.id)}
                            className={`shrink-0 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter transition-all border ${
                              flashSaleActive[fs.id]
                                ? "bg-mint text-white border-mint shadow-lg shadow-mint/20"
                                : "bg-transparent text-muted-foreground border-border hover:border-coral hover:text-coral"
                            }`}
                          >
                            {flashSaleActive[fs.id] ? "Live Now" : "Flash Sale"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Eco Impact Summary */}
              <div className="p-5 rounded-3xl bg-mint/5 border border-mint/20 text-center space-y-2">
                <p className="text-[10px] font-black text-mint uppercase tracking-widest">Sustainability Rank</p>
                <p className="font-display text-2xl font-bold text-foreground">Top 5%</p>
                <p className="text-[11px] text-muted-foreground">Kitchen waste reduction is exceeding targets this week.</p>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
