import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ChefHat, Map, UtensilsCrossed } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
  { to: "/kitchen", label: "Kitchen", icon: ChefHat },
  { to: "/floor", label: "Floor", icon: Map },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
];

export default function NavigationPill() {
  const location = useLocation();
  if (location.pathname === "/") return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1 p-1.5 rounded-full bg-card shadow-lg border border-border">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
