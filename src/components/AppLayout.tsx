import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Map, ChefHat, Package, Recycle, BarChart3,
  Settings, Truck, Leaf, LogOut, User, PanelLeftClose, PanelLeftOpen, QrCode
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Suppliers",  icon: Truck,          to: "/admin?view=suppliers" },
  { label: "Floor Map",  icon: Map,            to: "/floor" },
  { label: "Kitchen",    icon: ChefHat,        to: "/kitchen" },
  { label: "Inventory",  icon: Package,        to: "/admin?view=inventory" },
  { label: "Waste Log",  icon: Recycle,        to: "/waste" },
  { label: "Analytics",  icon: BarChart3,      to: "/admin?view=analytics" },
  { label: "QR Codes",   icon: QrCode,         to: "/qr" },
  { label: "Settings",   icon: Settings,       to: "/admin?view=settings" },
];

function AdminSidebar({
  open,
  onToggle,
  onLogout,
}: {
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
}) {
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out ${
        open ? "w-60" : "w-16"
      }`}
    >
      {/* Logo + toggle */}
      <div
        className={`flex items-center border-b border-border transition-all duration-300 ${
          open ? "px-5 py-5 gap-2.5 justify-between" : "px-0 py-5 justify-center"
        }`}
      >
        {open && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Leaf className="text-accent" size={18} />
            </div>
            <span className="font-display text-lg whitespace-nowrap">DineFlow</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          title={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {adminNavItems.map(({ label, icon: Icon, to }) => {
          // Active check: match pathname exactly, or for query-view items match base + param
          const [path, query] = to.split("?");
          const isActive = query
            ? location.pathname === path && location.search.includes(query.split("=")[1])
            : location.pathname === to && !location.search;

          const baseClass = `relative flex items-center rounded-lg text-sm font-medium transition-all ${
            open ? "gap-3 px-3 py-2.5 w-full" : "justify-center w-10 h-10 mx-auto"
          } ${
            isActive
              ? "bg-accent/10 text-accent font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`;

          return (
            <Link key={label} to={to} title={!open ? label : undefined} className={baseClass}>
              {isActive && open && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
              )}
              <Icon size={17} className={isActive ? "text-accent" : ""} />
              {open && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-border space-y-2 transition-all duration-300 ${
          open ? "p-4" : "p-2 flex flex-col items-center"
        }`}
      >
        {open ? (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-muted/60">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <User size={15} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Admin</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Restaurant Owner</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center" title="Admin">
            <User size={15} className="text-accent" />
          </div>
        )}
        <button
          onClick={onLogout}
          title={!open ? "Sign Out" : undefined}
          className={`flex items-center gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-coral hover:bg-coral/10 transition-all ${
            open ? "w-full px-3 py-2" : "w-10 h-10 justify-center"
          }`}
        >
          <LogOut size={14} />
          {open && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}



interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { userRole, setUserRole } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    setUserRole(null);
    navigate("/");
  };

  // Landing and auth pages — no chrome
  if (!userRole || location.pathname === "/login") return <>{children}</>;

  const isAdmin = userRole === "admin";
  const sidebarWidth = sidebarOpen ? "ml-60" : "ml-16";

  return (
    <div className="min-h-screen bg-background flex">
      {isAdmin && (
        <AdminSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          onLogout={handleLogout}
        />
      )}

      <main
        className={`flex-1 min-h-screen w-full transition-all duration-300 ease-in-out ${
          isAdmin ? sidebarWidth : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
