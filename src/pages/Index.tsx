import { Link } from "react-router-dom";
import { LayoutDashboard, ChefHat, Map, UtensilsCrossed, Leaf } from "lucide-react";

const views = [
  { to: "/admin", label: "Admin Dashboard", desc: "Strategy & KPIs for restaurant owners", icon: LayoutDashboard, color: "bg-accent/10 text-accent" },
  { to: "/kitchen", label: "Kitchen Panel", desc: "AI prep sheets & waste logging for chefs", icon: ChefHat, color: "bg-coral/10 text-coral" },
  { to: "/floor", label: "Floor Map", desc: "Real-time table status & alerts for staff", icon: Map, color: "bg-amber/10 text-amber" },
  { to: "/menu", label: "Customer Menu", desc: "Mobile ordering with eco impact tracking", icon: UtensilsCrossed, color: "bg-mint/10 text-mint" },
];

export default function LandingPage() {
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
        {views.map(({ to, label, desc, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="card-dineflow p-6 group hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <h2 className="font-display text-xl text-foreground mb-1">{label}</h2>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
