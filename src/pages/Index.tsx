import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ChefHat, Map, UtensilsCrossed, Leaf } from "lucide-react";
import { useApp, UserRole } from "@/contexts/AppContext";

const views = [
  { role: "admin", label: "Admin Dashboard", desc: "Strategy & KPIs for restaurant owners", icon: LayoutDashboard, color: "bg-accent/10 text-accent" },
  { role: "chef", label: "Kitchen Panel", desc: "AI prep sheets & waste logging for chefs", icon: ChefHat, color: "bg-coral/10 text-coral" },
  { role: "waiter", label: "Floor Map", desc: "Real-time table status & alerts for staff", icon: Map, color: "bg-amber/10 text-amber" },
  { role: "customer", label: "Customer Menu", desc: "Mobile ordering with eco impact tracking", icon: UtensilsCrossed, color: "bg-mint/10 text-mint" },
] as const;

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf className="text-accent" size={36} />
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">DineFlow</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          The Circular Economy Restaurant Platform — from procurement to plate to impact.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {views.map(({ role, label, desc, icon: Icon, color }) => (
          <button
            key={role}
            onClick={() => handleRoleSelect(role)}
            className="card-dineflow text-left p-6 group hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <h2 className="font-display text-xl text-foreground mb-1">Login as {label.split(' ')[0]}</h2>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
