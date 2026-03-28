import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Map, ChefHat, Package, Recycle, BarChart3, Settings,
  TrendingUp, Leaf, LogOut, User,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { statsData, chartData, suppliers } from "@/data/mockData";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin", active: true },
  { label: "Floor Map", icon: Map, to: "/floor" },
  { label: "Kitchen", icon: ChefHat, to: "/kitchen" },
  { label: "Inventory", icon: Package, to: "#" },
  { label: "Waste Log", icon: Recycle, to: "#" },
  { label: "Analytics", icon: BarChart3, to: "#" },
  { label: "Settings", icon: Settings, to: "#" },
];

const insights = [
  { icon: "🔮", text: "Biryani demand +35% predicted Saturday (Local cricket match)", action: "Act Now" },
  { icon: "⚠️", text: "Paneer stock 2 days from expiry — Flash sale recommended", action: "Act Now" },
  { icon: "✅", text: "Tomato order auto-adjusted: saved ₹2,300 vs last week", action: "View" },
  { icon: "📉", text: "Plate waste 18% above baseline — review portion sizes", action: "View" },
];

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function CircularProgress({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--accent))" strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000" />
    </svg>
  );
}

const statusColors: Record<string, string> = {
  pending: "bg-amber/15 text-amber",
  sent: "bg-mint/15 text-mint",
  error: "bg-coral/15 text-coral",
};

export default function AdminDashboard() {
  const revenue = useCountUp(statsData.revenueRecovered);
  const co2 = useCountUp(statsData.co2Saved);
  const efficiency = useCountUp(statsData.inventoryEfficiency);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col fixed h-screen">
        <div className="p-6 flex items-center gap-2">
          <Leaf className="text-accent" size={24} />
          <span className="font-display text-xl">DineFlow</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const active = item.to === location.pathname;
            return (
              <Link key={item.label} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <User size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 p-8 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl">Strategy Dashboard</h1>
            <p className="text-sm text-muted-foreground">Saturday, 28 March 2026 · The Green Table</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="card-dineflow p-6 animate-count-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Recovered</p>
                  <p className="font-display text-3xl mt-1">₹{revenue.toLocaleString("en-IN")}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-accent" />
                </div>
              </div>
              <span className="badge-pill bg-mint/15 text-mint">+18% vs last month</span>
            </div>

            <div className="card-dineflow p-6 animate-count-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                  <p className="font-display text-3xl mt-1">{co2} kg</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center">
                  <Leaf size={20} className="text-mint" />
                </div>
              </div>
              <span className="badge-pill bg-mint/15 text-mint">= {statsData.treesEquivalent} trees planted</span>
            </div>

            <div className="card-dineflow p-6 animate-count-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Efficiency</p>
                  <p className="font-display text-3xl mt-1">{efficiency}%</p>
                </div>
                <CircularProgress value={efficiency} />
              </div>
              <span className="badge-pill bg-accent/15 text-accent">+6% this week</span>
            </div>
          </div>

          {/* Chart + AI Insights */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 card-dineflow p-6">
              <h2 className="font-display text-lg mb-4">Daily Sales vs Food Waste Cost</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="#2D6A4F" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1500} />
                  <Line type="monotone" dataKey="waste" name="Waste" stroke="#E76F51" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-2 card-dineflow p-6">
              <h2 className="font-display text-lg mb-4">🔮 AI Insights</h2>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-lg">{ins.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{ins.text}</p>
                    </div>
                    <button className="btn-primary text-xs px-2 py-1 shrink-0"
                      onClick={() => toast.success("Action triggered (demo)")}>
                      {ins.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier Table */}
          <div className="card-dineflow overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="font-display text-lg">B2B Procurement</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Supplier</th>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Qty</th>
                  <th className="px-6 py-3 font-medium">Expected</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{s.supplier}</td>
                    <td className="px-6 py-4">{s.item}</td>
                    <td className="px-6 py-4 font-mono">{s.qty}</td>
                    <td className="px-6 py-4">{s.expected}</td>
                    <td className="px-6 py-4">
                      <span className={`badge-pill capitalize ${statusColors[s.status]}`}>{s.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-accent font-medium hover:underline"
                        onClick={() => toast.success(`${s.status === "error" ? "Retry" : "Resend"} sent to ${s.supplier}`)}>
                        {s.status === "error" ? "Retry" : s.status === "sent" ? "Track" : "Resend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
