import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ChefHat, Map, UtensilsCrossed, LogOut, Recycle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const navItems = [
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
  { to: "/kitchen", label: "Kitchen", icon: ChefHat },
  { to: "/waste", label: "Waste", icon: Recycle },
  { to: "/floor", label: "Floor", icon: Map },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
];

export default function NavigationPill() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, setUserRole } = useApp();

  if (location.pathname === "/" || location.pathname === "/admin" || !userRole) return null;

  const filteredNavItems = navItems.filter((item) => {
    if (userRole === "admin") return true;
    if (userRole === "chef" && (item.to === "/kitchen" || item.to === "/waste")) return true;
    if (userRole === "waiter" && item.to === "/floor") return true;
    if (userRole === "customer" && item.to === "/menu") return true;
    return false;
  });

  const handleLogout = () => {
    setUserRole(null);
    navigate("/");
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1 p-1.5 rounded-full frosted-glass shadow-xl">
      {filteredNavItems.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            title={label}
            className={`relative flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              active
                ? "text-accent bg-accent/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Icon size={18} />
            <span className="hidden sm:inline leading-none">{label}</span>
            {active && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        title="Logout"
        className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 text-muted-foreground hover:text-coral hover:bg-coral/10"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline leading-none">Logout</span>
      </button>
    </nav>
  );
}
