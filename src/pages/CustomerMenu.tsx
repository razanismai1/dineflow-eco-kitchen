import { useState, useEffect } from "react";
import { Leaf, Plus, Minus, ShoppingCart, Share2, X, ArrowRight, QrCode } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useCategories, useFlashSales, useMenuItems } from "@/hooks/useMenu";
import { useCreateOrder } from "@/hooks/useOrders";

type Filter = "All" | "Veg" | "Non-Veg" | "Flash Deals" | "Under ₹200";
const filters: Filter[] = ["All", "Veg", "Non-Veg", "Flash Deals", "Under ₹200"];

const flashGradients = [
  "from-accent/60 to-mint/40",
  "from-amber/50 to-coral/30",
  "from-steel/40 to-accent/30",
];

function CountdownTimer({ initialSeconds }: { initialSeconds: number }) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = Math.floor(secs / 60).toString().padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  const ending = secs < 600;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-mono text-sm font-medium ${ending ? "text-amber" : "text-muted-foreground"}`}>
        ⏰ {mm}:{ss}
      </span>
      {ending && <span className="badge-pill bg-amber/15 text-amber text-[10px] animate-pulse-badge">⚡ Ending Soon</span>}
    </div>
  );
}

function EcoScore({ score }: { score: number }) {
  const color = score >= 4 ? "text-mint" : score >= 3 ? "text-amber" : "text-muted-foreground";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < score ? color : "text-muted-foreground/20"}>🌿</span>
      ))}
    </span>
  );
}

export default function CustomerMenu() {
  const { cart, addToCart, removeFromCart, updateCartQty, clearCart, ecoPoints, addEcoPoints, setTablesState } = useApp();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table_id") ?? searchParams.get("table");
  const tableLabel = searchParams.get("table") ?? (tableId ? `T-${tableId}` : null);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const { data: rawCategories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: rawItems = [], isLoading: itemsLoading, error: itemsError } = useMenuItems();
  const { data: rawFlashSales = [], isLoading: flashLoading } = useFlashSales();
  const { mutate: createOrder } = useCreateOrder();

  const totalItems = cart.reduce((a, c) => a + c.quantity, 0);
  const totalPrice = cart.reduce((a, c) => a + c.price * c.quantity, 0);

  const menuItems = Array.isArray(rawItems)
    ? rawItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        desc: item.description || "",
        veg: !!item.is_vegan,
        ecoScore: Number(item.eco_score ?? 0),
        price: Number(item.price ?? item.base_price ?? 0),
        categoryId: item.category,
        image: item.image || item.image_url || null,
      }))
    : [];

  const flashSales = Array.isArray(rawFlashSales)
    ? rawFlashSales.map((sale: any) => {
        const base = Number(sale.menu_item_details?.base_price ?? sale.menu_item_base_price ?? 0);
        const discountPct = Number(sale.discount_percentage ?? 0);
        const salePrice = Math.max(0, Math.round((base * (100 - discountPct)) / 100));
        const endsAt = sale.active_until ? new Date(sale.active_until).getTime() : Date.now();
        const endsIn = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
        return {
          id: sale.id,
          name: sale.menu_item_name || sale.menu_item_details?.name || "Flash Deal",
          originalPrice: base,
          salePrice,
          endsIn,
          co2Saved: Number((discountPct / 25).toFixed(1)),
        };
      })
    : [];

  const flashSaleNames = flashSales.map((f) => f.name);

  const menuCategories = (Array.isArray(rawCategories) ? rawCategories : []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    items: menuItems.filter((item) => item.categoryId === cat.id),
  }));

  const filteredCategories = menuCategories
    .map((cat) => ({
      ...cat,
      items: (Array.isArray(cat.items) ? cat.items : []).filter((item) => {
        if (activeFilter === "Veg") return item.veg;
        if (activeFilter === "Non-Veg") return !item.veg;
        if (activeFilter === "Flash Deals") return flashSaleNames.includes(item.name);
        if (activeFilter === "Under ₹200") return item.price < 200;
        return true;
      }),
    }))
    .filter((cat) => cat.items.length > 0);

  const canPlaceOrder = !!tableId;

  const placeOrder = () => {
    if (!tableId) {
      toast.error("Please scan the QR code to select your table before ordering.");
      return;
    }

    createOrder(
      { items: cart.map(item => ({ id: item.id, quantity: item.quantity })), extra: { table_id: tableId } },
      {
        onSuccess: () => {
          setCartOpen(false);
          clearCart();
          addEcoPoints(85);
          if (tableLabel) {
            setTablesState((prev) =>
              prev.map((t) =>
                t.id === tableLabel
                  ? { ...t, status: "occupied" as const, timeSeated: 0, course: 1 }
                  : t
              )
            );
            toast.success(`Order placed for ${tableLabel}!`);
          }
          setShowReceipt(true);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to place order.');
        }
      }
    );
  };

  const handleShare = async () => {
    const text = `🌿 DineFlow Impact: I saved 1.2 kg CO₂ and earned 85 Eco-Points today! #DineFlow #Sustainability`;
    if (navigator.share) {
      try { await navigator.share({ title: "My DineFlow Impact", text }); }
      catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Impact summary copied to clipboard!");
    }
  };

  // Eco Receipt
  if (showReceipt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#1A3A2A" }}>
        <div className="max-w-md w-full mx-auto p-8 text-center space-y-6" style={{ color: "#F5F0E8" }}>
          <p className="text-sm tracking-widest opacity-70">🌿 DineFlow</p>
          <h1 className="font-display text-3xl leading-tight">YOUR IMPACT TODAY</h1>
          <div className="w-16 h-px mx-auto" style={{ background: "#F5F0E840" }} />

          <div className="space-y-6">
            <div className="animate-count-up">
              <p className="text-3xl">🌍</p>
              <p className="font-display text-4xl mt-1">1.2 kg</p>
              <p className="text-sm opacity-70 mt-1">CO₂ Saved</p>
            </div>
            <div className="animate-count-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-3xl">♻️</p>
              <p className="font-display text-4xl mt-1">0%</p>
              <p className="text-sm opacity-70 mt-1">Food Waste in your order</p>
            </div>
            <div className="animate-count-up" style={{ animationDelay: "0.4s" }}>
              <p className="text-3xl">🌿</p>
              <p className="font-display text-4xl mt-1">+85</p>
              <p className="text-sm opacity-70 mt-1">Eco-Points earned</p>
            </div>
          </div>

          <div className="w-16 h-px mx-auto" style={{ background: "#F5F0E840" }} />
          <p className="text-sm opacity-70">The Green Table{tableLabel ? ` · ${tableLabel}` : ""} · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="italic text-sm opacity-60">"You saved the equivalent of driving 8km less today."</p>
          <div className="w-16 h-px mx-auto" style={{ background: "#F5F0E840" }} />

          <div className="space-y-3 pt-2">
            <button onClick={handleShare}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
              style={{ background: "#F5F0E820", color: "#F5F0E8" }}>
              <Share2 size={16} /> Share Your Impact
            </button>
            <button onClick={() => setShowReceipt(false)}
              className="w-full py-3 rounded-lg font-medium text-sm"
              style={{ background: "#2D6A4F", color: "#F5F0E8" }}>
              View Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] relative pb-24">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg flex items-center gap-1">🍃 DineFlow</h1>
            <p className="text-xs text-muted-foreground">The Green Table</p>
          </div>
          <div className="flex items-center gap-2">
            {tableLabel && (
              <div className="flex items-center gap-1 bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full border border-accent/20">
                <QrCode size={11} />
                {tableLabel}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-accent">
              <Leaf size={16} />
              <span className="font-mono text-sm font-medium">{ecoPoints} pts</span>
            </div>
          </div>
        </header>

        {/* Flash Sale Carousel */}
        <section className="px-4 pt-4">
          <p className="text-sm font-medium mb-3">♻️ Zero-Waste Flash Deals — Limited Time!</p>
          {flashLoading ? (
             <div className="text-sm text-muted-foreground p-3">Loading flash sales...</div>
          ) : flashSales.length === 0 ? (
             <div className="text-sm text-muted-foreground p-3">No active flash deals right now.</div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
            {flashSales.map((fs, i) => (
              <div key={fs.id} className="min-w-[200px] snap-start card-dineflow overflow-hidden shrink-0">
                <div className={`h-28 bg-gradient-to-br ${flashGradients[i % flashGradients.length]} flex items-center justify-center`}>
                  <span className="text-4xl">{["🧀", "🍮", "🍲"][i]}</span>
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-display text-base">{fs.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground text-sm">₹{fs.originalPrice}</span>
                    <span className="text-accent font-bold">₹{fs.salePrice}</span>
                  </div>
                  <CountdownTimer initialSeconds={fs.endsIn} />
                  <p className="text-xs text-mint">🌿 Saves {fs.co2Saved} kg CO₂</p>
                  <button className="btn-primary w-full text-xs py-1.5"
                    onClick={() => addToCart({ id: fs.id + 100, name: fs.name, price: fs.salePrice })}>
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* Filter Bar */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeFilter === f ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:border-accent/50"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <section className="px-4 space-y-6 pb-4 mt-4">
           {(categoriesLoading || itemsLoading) && <div className="text-sm text-muted-foreground p-4 text-center">Loading menu...</div>}
           {(categoriesError || itemsError) && <div className="text-sm text-red-500 p-4 text-center text-coral">Failed to load menu.</div>}
           {!categoriesLoading && !itemsLoading && filteredCategories.length === 0 && (
             <div className="text-sm text-center text-muted-foreground py-10">No items match your filter.</div>
          )}
          {filteredCategories.map((cat) => (
            <div key={cat.name}>
              <h3 className="font-display text-lg sticky top-[73px] bg-background py-2 z-30">{cat.name}</h3>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="card-dineflow p-3 flex gap-3">
                    {item.image ? (
                      <div className="w-[60px] h-[60px] rounded-lg shrink-0 overflow-hidden bg-muted border border-border/50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-lg bg-muted flex items-center justify-center shrink-0 text-xl border border-border/50">
                        {item.veg ? "🥬" : "🍗"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm">{item.name}</p>
                        <span className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${item.veg ? "bg-mint" : "bg-coral"}`} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.desc}</p>
                      <EcoScore score={item.ecoScore} />
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className="font-medium text-sm">₹{item.price}</span>
                      <button className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center"
                        onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Floating Cart — gradient primary with shadow */}
        {totalItems > 0 && (
          <button onClick={() => setCartOpen(true)}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 max-w-[400px] w-[calc(100%-2rem)] py-3 px-5 rounded-xl font-medium text-sm flex items-center justify-between z-40"
            style={{
              background: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--mint)) 100%)",
              color: "hsl(var(--accent-foreground))",
              boxShadow: "0 8px 24px -4px hsl(var(--accent) / 0.45)",
            }}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={16} />
              {totalItems} item{totalItems > 1 ? "s" : ""} — ₹{totalPrice}
            </span>
            <span className="flex items-center gap-1">View Order <ArrowRight size={14} /></span>
          </button>
        )}

        {/* Cart Sheet */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px]" onClick={() => setCartOpen(false)}>
            <div className="frosted-glass w-full max-w-[430px] rounded-t-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} style={{ animation: "slideUp 0.3s ease-out" }}>
              <div className="w-12 h-1 bg-border rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg">Your Order</h3>
                <button onClick={() => setCartOpen(false)}><X size={20} className="text-muted-foreground" /></button>
              </div>

              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded-lg border border-border flex items-center justify-center"
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}><Minus size={12} /></button>
                      <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                      <button className="w-7 h-7 rounded-lg border border-border flex items-center justify-center"
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="font-display text-lg">₹{totalPrice}</span>
              </div>

              <label className="flex items-center gap-3 py-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#2D6A4F] rounded" />
                <span className="text-sm">🌿 Sync with my arrival (Pre-order)</span>
              </label>

              <button
                className={`w-full py-3 text-base ${canPlaceOrder ? "btn-primary" : "rounded-xl bg-muted text-muted-foreground hover:bg-muted/90"}`}
                onClick={placeOrder}
              >
                {canPlaceOrder ? "Place Order" : "Scan QR to Order"}
              </button>
            </div>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
