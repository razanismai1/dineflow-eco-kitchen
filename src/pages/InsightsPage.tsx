import React, { useState } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
  Cloud, Flame, Wind, Zap, Package, Trophy, Activity,
  ChevronRight, Info, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { toast } from "sonner";
import { useDailyInsight, useRegenerateInsight } from "@/hooks/useInsights";

// ── Insight type styles ───────────────────────────────────────────────────────
const INSIGHT_STYLES: Record<string, { badge: string; card: string; dot: string }> = {
  high_demand:  { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", card: "border-emerald-500/20 bg-emerald-500/5", dot: "bg-emerald-400" },
  low_demand:   { badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",       card: "border-amber-500/20 bg-amber-500/5",   dot: "bg-amber-400"   },
  zero_seller:  { badge: "bg-amber-600/15 text-amber-500 border-amber-600/20",       card: "border-amber-600/20 bg-amber-500/5",   dot: "bg-amber-500"   },
  waste:        { badge: "bg-rose-500/15 text-rose-400 border-rose-500/20",           card: "border-rose-500/20 bg-rose-500/5",     dot: "bg-rose-400"    },
  expiry:       { badge: "bg-orange-500/15 text-orange-400 border-orange-500/20",    card: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400"  },
  warning:      { badge: "bg-rose-500/15 text-rose-400 border-rose-500/20",           card: "border-rose-500/20 bg-rose-500/5",     dot: "bg-rose-400"    },
  success:      { badge: "bg-teal-500/15 text-teal-400 border-teal-500/20",           card: "border-teal-500/20 bg-teal-500/5",     dot: "bg-teal-400"    },
};
const INSIGHT_LABELS: Record<string, string> = {
  high_demand: "🔥 High Demand", low_demand: "📉 Slow Seller", zero_seller: "💤 No Sales",
  waste: "⚠️ Waste Alert", expiry: "⏳ Expiring", warning: "⚠️ Warning", success: "✅ All Good",
};
const ACTION_STYLES: Record<string, string> = {
  "Stock Up":   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  "Promote":    "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  "Flash Sale": "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  "Review":     "bg-rose-500/15 text-rose-400 border border-rose-500/30",
  "Act Now":    "bg-rose-600/15 text-rose-400 border border-rose-600/30",
  "View":       "bg-muted text-muted-foreground border border-border",
};

// ── Busyness meter ────────────────────────────────────────────────────────────
function BusynessMeter({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? "#ef4444" :
    score >= 60 ? "#f97316" :
    score >= 40 ? "#eab308" :
    "#22c55e";

  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl" style={{ color }}>{score}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span
        className="mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
        style={{ background: `${color}22`, color }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

// ── Recommendation badge ──────────────────────────────────────────────────────
const REC_STYLES: Record<string, string> = {
  Promote:      "bg-amber-500/15 text-amber-400",
  Keep:         "bg-teal-500/15 text-teal-400",
  Remove:       "bg-rose-500/15 text-rose-400",
  "Flash Sale": "bg-orange-500/15 text-orange-400",
  Bundle:       "bg-violet-500/15 text-violet-400",
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { data: insightData, isLoading, isError } = useDailyInsight();
  const regenerate = useRegenerateInsight();
  const [sellerTab, setSellerTab] = useState<"yesterday" | "this_week" | "this_month">("this_week");

  const report = insightData?.report;

  const handleRegenerate = async () => {
    try {
      await regenerate.mutateAsync(undefined);
      toast.success("Insight report regenerated from Groq AI 🔮");
    } catch {
      toast.error("Regeneration failed — check your GROQ_API_KEY");
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-8 w-48" /></div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="text-4xl">🔮</span>
        <p className="text-muted-foreground text-sm">No insights yet. Generate the first report.</p>
        <button onClick={handleRegenerate} disabled={regenerate.isPending}
          className="btn-primary flex items-center gap-2 px-4 py-2">
          <RefreshCw size={14} className={regenerate.isPending ? "animate-spin" : ""} />
          {regenerate.isPending ? "Generating…" : "Generate Now"}
        </button>
      </div>
    );
  }

  const busy   = report.busyness_prediction ?? {};
  const top    = report.top_sellers ?? {};
  const sellers = (top[sellerTab] ?? []) as Array<{name:string; units:number; note?:string}>;
  const least  = (report.least_sold ?? []) as any[];
  const waste  = (report.waste_alerts ?? []) as any[];
  const prep   = (report.prep_recommendations ?? []) as any[];
  const cards  = (report.insights ?? []) as any[];

  const maxUnits = sellers.length ? Math.max(...sellers.map(s => s.units || 0)) : 1;

  const TAB_LABELS = {
    yesterday: "Yesterday",
    this_week: "This Week",
    this_month: "This Month",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Admin › AI Insights
          </p>
          <h1 className="font-display text-2xl">Daily Intelligence Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Clock size={12} />
            {insightData?.date}
            &nbsp;·&nbsp;
            {insightData?.is_fallback ? (
              <span className="text-amber-400">Rule-based fallback</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap size={11} /> Groq AI
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerate.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/30 text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={regenerate.isPending ? "animate-spin" : ""} />
          {regenerate.isPending ? "Generating…" : "Regenerate"}
        </button>
      </div>

      {/* ─── Row 1: Busyness + Weather + Quick Insights ─────────────────── */}
      <div className="grid grid-cols-5 gap-6">

        {/* Busyness Dial */}
        <div className="col-span-2 card-dineflow p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="font-display text-base self-start">🔮 Today's Busyness</h2>
          <BusynessMeter score={busy.score ?? 50} label={busy.label ?? "Moderate"} />
          {busy.reasoning && (
            <p className="text-xs text-muted-foreground text-center leading-relaxed mt-1">
              {busy.reasoning}
            </p>
          )}
        </div>

        {/* Weather + Season */}
        <div className="col-span-1 card-dineflow p-6 flex flex-col justify-between">
          <h2 className="font-display text-base mb-3">☁️ Weather · Kochi</h2>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <p className="text-sm text-foreground/90 leading-relaxed">
              {report.weather_summary || "—"}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Active Seasons</p>
            <div className="flex flex-wrap gap-1">
              {(report.season_labels ?? []).length > 0
                ? (report.season_labels as string[]).map((s: string) => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                      {s}
                    </span>
                  ))
                : <span className="text-xs text-muted-foreground">No active season</span>
              }
            </div>
          </div>
        </div>

        {/* Quick Insights (5 cards) */}
        <div className="col-span-2 card-dineflow p-6 flex flex-col gap-2.5">
          <h2 className="font-display text-base mb-1">⚡ Quick Insights</h2>
          {cards.map((ins: any, i: number) => {
            const s = INSIGHT_STYLES[ins.type] ?? INSIGHT_STYLES.success;
            const a = ACTION_STYLES[ins.action] ?? ACTION_STYLES["View"];
            return (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${s.card}`}>
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center border border-border/60 text-sm">
                    {ins.icon}
                  </div>
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${s.dot} ring-1 ring-background`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-full border mb-0.5 ${s.badge}`}>
                    {INSIGHT_LABELS[ins.type] ?? ins.type}
                  </span>
                  <p className="text-[11px] leading-snug text-foreground/90">{ins.text}</p>
                </div>
                <button className={`text-[9px] font-medium px-2 py-0.5 rounded-md shrink-0 ${a}`}>
                  {ins.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Row 2: Top Sellers chart ────────────────────────────────────── */}
      <div className="card-dineflow p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="font-display text-lg">Top Sellers</h2>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60">
            {(["yesterday", "this_week", "this_month"] as const).map(t => (
              <button
                key={t}
                onClick={() => setSellerTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sellerTab === t
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {sellers.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data for this timeframe
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sellers} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                type="category" dataKey="name" width={140}
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number) => [`${v} units`, "Sold"]}
              />
              <Bar dataKey="units" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {sellers.map((_, i) => {
                  const intensity = Math.max(0.3, (sellers[i].units || 0) / maxUnits);
                  return (
                    <Cell
                      key={i}
                      fill={`hsl(142 72% ${Math.round(35 + 25 * (1 - intensity))}%)`}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ─── Row 3: Least Sold + Waste Alerts ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Least Sold */}
        <div className="card-dineflow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-amber-400" />
            <h2 className="font-display text-base">Least Sold Dishes</h2>
          </div>
          {least.length === 0 ? (
            <p className="text-sm text-muted-foreground">All dishes selling well! ✅</p>
          ) : (
            <div className="space-y-3">
              {least.map((item: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.orders_this_month ?? 0} orders this month
                      </p>
                      {item.condition && (
                        <div className="flex items-start gap-1 mt-1.5">
                          <Info size={10} className="text-amber-400 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-amber-400/90 leading-snug">{item.condition}</p>
                        </div>
                      )}
                    </div>
                    {item.recommendation && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${REC_STYLES[item.recommendation] ?? "bg-muted text-muted-foreground"}`}>
                        {item.recommendation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waste Alerts */}
        <div className="card-dineflow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-rose-400" />
            <h2 className="font-display text-base">Waste Alerts</h2>
          </div>
          {waste.length === 0 ? (
            <p className="text-sm text-muted-foreground">No significant waste detected 🎉</p>
          ) : (
            <div className="space-y-3">
              {waste.map((w: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{w.name}</p>
                    <span className="text-xs text-rose-400 font-semibold">
                      {w.waste_qty} {w.unit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Reason: {w.reason}</p>
                  {w.action && (
                    <p className="text-[10px] text-rose-400/80 mt-1">→ {w.action}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Row 4: Prep Recommendations ────────────────────────────────── */}
      {prep.length > 0 && (
        <div className="card-dineflow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-sky-400" />
            <h2 className="font-display text-base">Prep Sheet Recommendations</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {prep.map((p: any, i: number) => {
              const urgencyColor =
                p.urgency === 'high'   ? "border-rose-500/30 bg-rose-500/5" :
                p.urgency === 'medium' ? "border-orange-500/30 bg-orange-500/5" :
                                         "border-border bg-muted/20";
              const urgencyDot =
                p.urgency === 'high'   ? "bg-rose-400" :
                p.urgency === 'medium' ? "bg-orange-400" :
                                         "bg-teal-400";
              return (
                <div key={i} className={`p-3 rounded-xl border ${urgencyColor}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${urgencyDot}`} />
                    <p className="text-sm font-medium truncate">{p.item}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{p.action}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
