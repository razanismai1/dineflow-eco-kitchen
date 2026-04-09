import { useNavigate } from "react-router-dom";
import { ChefHat, UtensilsCrossed, ArrowRight, Package, Leaf } from "lucide-react";

const pipeline = [
  { icon: Package, label: "Procurement" },
  { icon: ChefHat, label: "Prep" },
  { icon: UtensilsCrossed, label: "Service" },
  { icon: Leaf, label: "Eco Impact" },
];

export default function LandingPage() {
  const navigate = useNavigate();

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

        <div className="flex items-center justify-center pt-1 mb-10">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-accent-foreground transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--mint)))", boxShadow: "0 4px 18px -4px hsl(var(--accent)/0.45)" }}
          >
            Sign In <ArrowRight size={15} />
          </button>
        </div>
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
