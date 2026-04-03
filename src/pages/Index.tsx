import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ChefHat, Map, UtensilsCrossed, ArrowRight, Package, Leaf } from "lucide-react";
import { useApp, UserRole } from "@/contexts/AppContext";

const views = [
  {
    role: "admin",
    label: "Admin",
    sublabel: "Dashboard",
    desc: "Strategy, KPIs, inventory & supplier management",
    icon: LayoutDashboard,
    glow: "hover:shadow-[0_8px_32px_-4px_hsl(153,42%,30%,0.35)]",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    border: "hover:border-accent/40",
  },
  {
    role: "chef",
    label: "Kitchen",
    sublabel: "Panel",
    desc: "AI prep sheets, live orders & flash sales",
    icon: ChefHat,
    glow: "hover:shadow-[0_8px_32px_-4px_hsl(14,76%,61%,0.35)]",
    iconBg: "bg-coral/10",
    iconColor: "text-coral",
    border: "hover:border-coral/40",
  },
  {
    role: "waiter",
    label: "Floor",
    sublabel: "Map",
    desc: "Real-time table status & live alerts for staff",
    icon: Map,
    glow: "hover:shadow-[0_8px_32px_-4px_hsl(27,88%,67%,0.35)]",
    iconBg: "bg-amber/10",
    iconColor: "text-amber",
    border: "hover:border-amber/40",
  },
  {
    role: "customer",
    label: "Customer",
    sublabel: "Menu",
    desc: "Mobile ordering with eco impact tracking",
    icon: UtensilsCrossed,
    glow: "hover:shadow-[0_8px_32px_-4px_hsl(147,38%,62%,0.35)]",
    iconBg: "bg-mint/10",
    iconColor: "text-mint",
    border: "hover:border-mint/40",
  },
] as const;

const pipeline = [
  { icon: Package, label: "Procurement" },
  { icon: ChefHat, label: "Prep" },
  { icon: UtensilsCrossed, label: "Service" },
  { icon: Leaf, label: "Eco Impact" },
];

export default function LandingPage() {
  const { setUserRole } = useApp();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    switch (role) {
      case "admin": navigate("/admin"); break;
      case "chef": navigate("/kitchen"); break;
      case "waiter": navigate("/floor"); break;
      case "customer": navigate("/menu"); break;
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-8 overflow-hidden">

      {/* Animated leaf blobs — subtle background motion */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(var(--mint)) 0%, transparent 70%)",
          animation: "float 11s ease-in-out infinite reverse",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/4 w-56 h-56 rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, hsl(var(--amber)) 0%, transparent 70%)",
          animation: "float 13s ease-in-out infinite 2s",
        }}
      />

      {/* Hero */}
      <div className="relative text-center mb-10 space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Leaf className="text-accent" size={22} />
          </div>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl">
          <span className="text-gradient">DineFlow</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          The Circular Economy Restaurant Platform —<br />
          from procurement · to plate · to impact.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          🌿 Powering zero-waste dining
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-accent-foreground transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--mint)))", boxShadow: "0 4px 18px -4px hsl(var(--accent)/0.45)" }}
          >
            Sign In <ArrowRight size={15} />
          </button>
          <span className="text-muted-foreground text-sm">or quick-enter below</span>
        </div>
      </div>

      {/* Role cards grid */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full mb-10">
        {views.map(({ role, label, sublabel, desc, icon: Icon, glow, iconBg, iconColor, border }) => (
          <button
            key={role}
            onClick={() => handleRoleSelect(role as UserRole)}
            className={`card-dineflow text-left p-6 group border border-border transition-all duration-200 hover:-translate-y-1 ${glow} ${border}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 ${iconBg}`}>
              <Icon size={22} className={iconColor} />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <h2 className="font-display text-xl text-foreground">{label}</h2>
              <span className="text-sm text-muted-foreground font-normal">{sublabel}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            <div className={`flex items-center gap-1 mt-4 text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 ${iconColor}`}>
              Enter <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>

      {/* How it works pipeline */}
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {pipeline.map(({ icon: Icon, label }, i) => (
          <span key={label} className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              <Icon size={12} />
              {label}
            </span>
            {i < pipeline.length - 1 && <ArrowRight size={12} className="text-border" />}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
