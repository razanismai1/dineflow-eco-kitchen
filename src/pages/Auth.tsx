import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { usersApi } from "@/api/users";
import { toast } from "sonner";
import {
  Leaf, Eye, EyeOff, Mail, Lock, User, ChefHat, Map, UtensilsCrossed,
  LayoutDashboard, ArrowRight, Check
} from "lucide-react";

/* ── Role config ─────────────────────────────────────────────────────────── */
const roles = [
  {
    id: "admin",
    label: "Admin",
    sub: "Full access",
    icon: LayoutDashboard,
    color: "accent",
    dest: "/admin",
    bg: "bg-accent/10 border-accent/30",
    activeBg: "bg-accent text-accent-foreground",
  },
  {
    id: "chef",
    label: "Chef",
    sub: "Kitchen & prep",
    icon: ChefHat,
    color: "coral",
    dest: "/kitchen",
    bg: "bg-coral/10 border-coral/30",
    activeBg: "bg-coral text-white",
  },
  {
    id: "waiter",
    label: "Waiter",
    sub: "Floor service",
    icon: Map,
    color: "steel",
    dest: "/floor",
    bg: "bg-steel/10 border-steel/30",
    activeBg: "bg-steel text-white",
  },
  {
    id: "customer",
    label: "Customer",
    sub: "Order & dine",
    icon: UtensilsCrossed,
    color: "mint",
    dest: "/menu",
    bg: "bg-mint/10 border-mint/30",
    activeBg: "bg-mint text-white",
  },
] as const;

type RoleId = (typeof roles)[number]["id"];

const defaultRouteByRole: Record<RoleId, string> = {
  admin: "/admin",
  chef: "/kitchen",
  waiter: "/floor",
  customer: "/menu",
};

const isRouteAllowedForRole = (route: string, role: RoleId) => {
  if (!route.startsWith("/")) return false;
  if (route.startsWith("/admin") || route.startsWith("/qr")) return role === "admin";
  if (route.startsWith("/kitchen") || route.startsWith("/waste")) return role === "admin" || role === "chef";
  if (route.startsWith("/floor")) return role === "admin" || role === "waiter";
  if (route.startsWith("/menu") || route.startsWith("/")) return true;
  return false;
};

/* ── Floating leaf blobs (decorative) ───────────────────────────────────── */
const blobs = [
  { w: 340, h: 340, x: -80, y: -80, opacity: 0.18, delay: "0s" },
  { w: 260, h: 260, x: "60%", y: "55%", opacity: 0.13, delay: "2s" },
  { w: 180, h: 180, x: "20%", y: "70%", opacity: 0.10, delay: "4s" },
];

export default function Auth() {
  const { setUserRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: loginApi } = useLogin();
  const { mutateAsync: registerApi } = useRegister();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleId>("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
         setUserRole(null);
         const loginData = await loginApi({ username, password });
         let fetchedRole = loginData?.role?.toLowerCase();

         if (!fetchedRole) {
           const userData = await usersApi.getMe();
           fetchedRole = userData?.role?.toLowerCase();
         }

         if (!fetchedRole) {
           throw new Error("Unable to determine user role after login.");
         }
         
         const role = fetchedRole === "waiter" ? "waiter" : fetchedRole;
         setUserRole(role as "admin" | "chef" | "waiter" | "customer");
         localStorage.setItem("user_role", role);

         const normalizedRole = role as RoleId;
         const from = (location.state as { from?: string } | null)?.from;
         const nextRoute = from && isRouteAllowedForRole(from, normalizedRole)
           ? from
           : defaultRouteByRole[normalizedRole];

         navigate(nextRoute, { replace: true });
      } else {
        await registerApi({
          username,
          password,
          name,
          role: selectedRole,
        });
         toast.success("Account created successfully! Please log in.");
         setMode("login");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate with server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find((r) => r.id === selectedRole)!;

  return (
    <div className="min-h-screen flex bg-background font-sans">

      {/* ── Left Brand Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[46%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(145deg, hsl(var(--accent)) 0%, hsl(145 40% 28%) 60%, hsl(var(--mint)) 100%)" }}>

        {/* Blobs */}
        {blobs.map((b, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: b.w, height: b.h, left: b.x, top: b.y,
              background: "white", opacity: b.opacity,
              animation: `float ${6 + i * 2}s ease-in-out infinite alternate`,
              animationDelay: b.delay, filter: "blur(40px)",
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-14">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-white font-display text-2xl tracking-tight">DineFlow</span>
          </div>

          {/* Hero text */}
          <div className="mb-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-white/90 text-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Circular Economy Restaurant OS
            </div>
            <h1 className="text-white text-4xl font-display leading-tight">
              Zero-waste dining,<br />
              <span className="text-white/70">start to finish.</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-xs">
              From prep sheets to floor maps — manage your restaurant with precision and purpose.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-2 pt-2">
              {[
                "AI-powered prep sheets",
                "Real-time floor management",
                "Eco impact tracking",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom attribution */}
          <p className="text-white/40 text-xs mt-8">
            🌿 Helping restaurants cut food waste by up to 30%
          </p>
        </div>
      </div>

      {/* ── Right Auth Panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">

        {/* Subtle bg pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(hsl(var(--accent)/0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Leaf size={18} className="text-accent" />
            </div>
            <span className="font-display text-xl">DineFlow</span>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">

            {/* Heading */}
            <div>
              <h2 className="font-display text-2xl">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === "login"
                  ? "Sign in to your DineFlow workspace"
                  : "Set up your role and get started"}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-muted rounded-xl p-1 text-sm font-medium">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    mode === m
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name (signup only) */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="restaurant_user"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>



              {/* Error */}
              {error && (
                <p className="text-xs text-coral bg-coral/8 border border-coral/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Forgot password */}
              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-muted-foreground hover:text-accent transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-accent-foreground transition-all disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--mint)) 100%)",
                  boxShadow: "0 6px 20px -4px hsl(var(--accent) / 0.4)",
                }}>
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                className="text-accent font-semibold hover:underline transition-all">
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          {/* Quick demo note */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Demo: any username &amp; password (6+ chars) — role routes you to the right module
          </p>
        </div>
      </div>
    </div>
  );
}
