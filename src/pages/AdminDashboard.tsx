import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Map, ChefHat, Package, Recycle, BarChart3, Settings,
  TrendingUp, Leaf, LogOut, User, Truck, Plus, Check, X, ChevronRight, ChevronDown, Save, AlertTriangle, AlertCircle, Edit2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { statsData, chartData, suppliers as initialSuppliers, initialInventory } from "@/data/mockData";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

const CATEGORIES = [
  "Fruits and Vegetables", "Dairy", "Masala, Salt and Sugar", "Chicken and Eggs",
  "Sauces and Seasoning", "Packaging Material", "Canned and Imported Items",
  "Edible Oils", "Frozen and Instant Food", "Bakery and Chocolates", "Flours",
  "Pulses", "Beverages and Mixers", "Dry Fruits and Nuts", "Rice and Rice Products",
  "Mutton, Duck and Lamb", "Fish, Prawns and Seafood"
];

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, view: "dashboard" },
  { label: "Suppliers", icon: Truck, view: "suppliers" },
  { label: "Floor Map", icon: Map, to: "/floor" },
  { label: "Kitchen", icon: ChefHat, to: "/kitchen" },
  { label: "Inventory", icon: Package, view: "inventory" },
  { label: "Waste Log", icon: Recycle, view: "waste" },
  { label: "Analytics", icon: BarChart3, view: "analytics" },
  { label: "Settings", icon: Settings, view: "settings" },
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
  const [currentView, setCurrentView] = useState("dashboard");
  const { setUserRole } = useApp();
  const [suppliersList, setSuppliersList] = useState(initialSuppliers);
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(null);

  // Add Vendor Modal State
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [vendorPhone, setVendorPhone] = useState("");

  // Inventory State
  const [inventoryList, setInventoryList] = useState(initialInventory);
  
  // Inventory Setup Modal State
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState(CATEGORIES[0]);
  const [itemQty, setItemQty] = useState<number | string>("");
  const [itemUnit, setItemUnit] = useState("kg");
  const [itemDailyReq, setItemDailyReq] = useState<number | string>("");

  const openInventoryModal = (item?: typeof initialInventory[0]) => {
    if (item) {
      setEditingItemId(item.id);
      setItemName(item.name);
      setItemCategory(item.category);
      setItemQty(item.quantity);
      setItemUnit(item.unit);
      setItemDailyReq(item.dailyRequirement);
    } else {
      setEditingItemId(null);
      setItemName("");
      setItemCategory(CATEGORIES[0]);
      setItemQty("");
      setItemUnit("kg");
      setItemDailyReq("");
    }
    setIsInventoryModalOpen(true);
  };

  const handleSaveInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(itemQty) || 0;
    const dailyReq = Number(itemDailyReq) || 0;
    
    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (qty <= 0) status = "Out of Stock";
    else if (qty <= dailyReq) status = "Low Stock";

    if (editingItemId) {
      setInventoryList(prev => prev.map(item => 
        item.id === editingItemId ? {
          ...item,
          name: itemName,
          category: itemCategory,
          quantity: qty,
          unit: itemUnit,
          dailyRequirement: dailyReq,
          status
        } : item
      ));
      toast.success("Inventory item updated");
    } else {
      const newItem = {
        id: Math.max(...inventoryList.map(i => i.id), 0) + 1,
        name: itemName,
        category: itemCategory,
        quantity: qty,
        unit: itemUnit,
        dailyRequirement: dailyReq,
        status
      };
      setInventoryList([...inventoryList, newItem]);
      toast.success("Inventory item added");
    }
    setIsInventoryModalOpen(false);
  };

  // Settings State
  const [restaurantName, setRestaurantName] = useState("The Green Table");
  const [emailAddress, setEmailAddress] = useState("admin@thegreentable.com");
  const [phoneNumber, setPhoneNumber] = useState("+91-9876543210");
  const [restaurantLocation, setRestaurantLocation] = useState("All");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [lowStockWarnings, setLowStockWarnings] = useState(true);

  const handleLogout = () => {
    setUserRole(null);
  }

  const toggleExpand = (id: number) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
  };

  const toggleSupplierStatus = (id: number) => {
    setSuppliersList(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'sent' ? 'pending' : 'sent';
        return { ...s, status: newStatus as any };
      }
      return s;
    }));
    toast.success("Supplier status updated");
  };

  const deleteSupplier = (id: number) => {
    setSuppliersList(prev => prev.filter(s => s.id !== id));
    toast.success("Supplier removed");
  };

  const toggleSupplierSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSuppliersList(prev => prev.map(s => {
      if (s.id === id) {
        if (!s.isSelected) toast.success(`${s.supplier} added to Selected Suppliers`);
        return { ...s, isSelected: !s.isSelected };
      }
      return s;
    }));
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const newSupplier = {
      id: Math.max(...suppliersList.map(s => s.id), 0) + 1,
      supplier: vendorName,
      itemCategories: vendorCategories,
      contactNumber: vendorPhone,
      qty: "—",
      expected: "—",
      status: "pending" as const,
      location: restaurantLocation === "All" ? "Custom Location" : `${restaurantLocation} (Custom)`,
      operatingDays: "—",
      operationalTime: "—",
      returnPolicy: "—",
      paymentTerms: "—",
      isCustom: true
    };

    setSuppliersList([...suppliersList, newSupplier]);
    setIsAddVendorModalOpen(false);
    setVendorName("");
    setVendorPhone("");
    setVendorCategories([]);
    toast.success("Vendor added successfully");
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
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
    </div>
  );

  const renderSupplierTable = (list: typeof suppliersList, title: string, emptyMessage: string) => (
    <div className="mb-10">
      <h3 className="font-display text-lg mb-4">{title}</h3>
      <div className="card-dineflow overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
              <th className="px-6 py-4 font-medium w-10"></th>
              <th className="px-6 py-4 font-medium">Supplier</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <React.Fragment key={s.id}>
                <tr 
                  onClick={() => toggleExpand(s.id)}
                  className={`border-b border-border hover:bg-muted/10 transition-colors cursor-pointer ${expandedSupplierId === s.id ? "bg-muted/50" : ""}`}
                >
                  <td className="px-6 py-4 text-muted-foreground">
                    {expandedSupplierId === s.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <Truck size={14} />
                    </div>
                    <span className="truncate max-w-[120px]" title={s.supplier}>{s.supplier}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={s.itemCategories.join(', ')}>
                    {s.itemCategories.join(', ')}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{s.contactNumber}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={(e) => toggleSupplierSelect(s.id, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${s.isSelected ? 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20' : 'bg-transparent text-foreground border-border hover:bg-muted'}`}
                    >
                      {s.isSelected ? 'Deselect' : 'Select'}
                    </button>
                  </td>
                </tr>
                {expandedSupplierId === s.id && (
                  <tr className="bg-muted/30 border-b border-border animate-in slide-in-from-top-1 duration-200">
                    <td colSpan={5} className="px-12 py-6">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Location</p>
                          <p className="text-sm">{s.location}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Operating Days</p>
                          <p className="text-sm">{s.operatingDays}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Operational Time</p>
                          <p className="text-sm">{s.operationalTime}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Return Policy</p>
                          <p className="text-sm">{s.returnPolicy}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Payment Terms</p>
                          <p className="text-sm">{s.paymentTerms}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSuppliers = () => {
    const selectedSuppliers = suppliersList.filter(s => s.isSelected);
    const customSuppliers = suppliersList.filter(s => !s.isSelected && s.isCustom);
    const regionalSuppliers = suppliersList.filter(s => !s.isSelected && !s.isCustom && (restaurantLocation === "All" || s.location.toLowerCase().includes(restaurantLocation.toLowerCase())));

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Supplier Management</h1>
            <p className="text-sm text-muted-foreground">Manage vendors and automated procurement</p>
          </div>
          <button 
            onClick={() => setIsAddVendorModalOpen(true)}
            className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Vendor
          </button>
        </div>

        {selectedSuppliers.length > 0 && renderSupplierTable(selectedSuppliers, "Selected Suppliers", "No selected suppliers found.")}
        {renderSupplierTable(regionalSuppliers, "Regional Suppliers", "No regional suppliers found for this location.")}
        {renderSupplierTable(customSuppliers, "Custom Suppliers", "No custom suppliers added yet.")}
      </div>
    );
  };

  const renderInventory = () => {
    const totalItems = inventoryList.length;
    const lowStockItems = inventoryList.filter(item => item.status === "Low Stock").length;
    const outOfStockItems = inventoryList.filter(item => item.status === "Out of Stock").length;

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Track stock levels and set automated alerts</p>
          </div>
          <button 
            onClick={() => openInventoryModal()}
            className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-dineflow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Package size={20} className="text-accent" />
              <h3 className="font-medium text-foreground">Total Items</h3>
            </div>
            <p className="text-3xl font-display">{totalItems}</p>
          </div>
          <div className="card-dineflow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <AlertTriangle size={20} className="text-amber" />
              <h3 className="font-medium text-foreground">Low Stock</h3>
            </div>
            <p className="text-3xl font-display text-amber">{lowStockItems}</p>
          </div>
          <div className="card-dineflow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <AlertCircle size={20} className="text-coral" />
              <h3 className="font-medium text-foreground">Out of Stock</h3>
            </div>
            <p className="text-3xl font-display text-coral">{outOfStockItems}</p>
          </div>
        </div>

        <div className="card-dineflow overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                <th className="px-6 py-4 font-medium">Item Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Daily Req</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono">{item.quantity}</span> <span className="text-muted-foreground text-xs">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">
                    {item.dailyRequirement} {item.unit} / day
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                      ${item.status === 'In Stock' ? 'bg-mint/15 text-mint' : 
                        item.status === 'Low Stock' ? 'bg-amber/15 text-amber' : 'bg-coral/15 text-coral'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => openInventoryModal(item)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      title="Edit / Setup Item"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {inventoryList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No items in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your restaurant and account preferences</p>
        </div>
        <button 
          onClick={() => toast.success("Settings saved successfully!")}
          className="btn-primary flex items-center gap-2">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile & Restaurant */}
          <div className="card-dineflow p-6">
            <h2 className="font-display text-lg mb-4">Profile & Restaurant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                <input type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} 
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select value={restaurantLocation} onChange={e => setRestaurantLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all">
                  <option value="All">All Regions</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1.5">Supplier availability is filtered based on this location.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="card-dineflow p-6">
            <h2 className="font-display text-lg mb-4">Notifications</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">Daily summaries & reports</p>
                </div>
                <button onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative w-10 h-5 rounded-full transition-colors outline-none ${emailAlerts ? 'bg-accent' : 'bg-muted'}`}>
                  <span className={`block w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">SMS Alerts</p>
                  <p className="text-xs text-muted-foreground">For critical updates only</p>
                </div>
                <button onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative w-10 h-5 rounded-full transition-colors outline-none ${smsAlerts ? 'bg-accent' : 'bg-muted'}`}>
                  <span className={`block w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${smsAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Low Stock Warnings</p>
                  <p className="text-xs text-muted-foreground">Notify when items hit threshold</p>
                </div>
                <button onClick={() => setLowStockWarnings(!lowStockWarnings)}
                  className={`relative w-10 h-5 rounded-full transition-colors outline-none ${lowStockWarnings ? 'bg-accent' : 'bg-muted'}`}>
                  <span className={`block w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${lowStockWarnings ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col fixed h-screen z-10">
        <div className="p-6 flex items-center gap-2">
          <Leaf className="text-accent" size={24} />
          <span className="font-display text-xl">DineFlow</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => {
            if (item.to) {
              return (
                <Link key={item.label} to={item.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground">
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            }
            return (
              <button key={item.label} onClick={() => setCurrentView(item.view as string)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.view ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center border border-accent/20">
              <User size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <button onClick={handleLogout} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive transition-colors">
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 p-8 pb-24 min-h-screen overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {currentView === "dashboard" && renderDashboard()}
          {currentView === "suppliers" && renderSuppliers()}
          {currentView === "settings" && renderSettings()}
          {currentView === "inventory" && renderInventory()}
          {currentView !== "dashboard" && currentView !== "suppliers" && currentView !== "settings" && currentView !== "inventory" && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Module under construction
            </div>
          )}
        </div>
      </main>

      {/* Inventory Setup Modal */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">{editingItemId ? "Setup Inventory Item" : "Add Inventory Item"}</h2>
              <button 
                onClick={() => setIsInventoryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveInventoryItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name <span className="text-coral">*</span></label>
                <input required type="text" value={itemName} onChange={e => setItemName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                  placeholder="e.g. Tomatoes" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category <span className="text-coral">*</span></label>
                <select value={itemCategory} onChange={e => setItemCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all">
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Quantity <span className="text-coral">*</span></label>
                  <input required type="number" min="0" step="any" value={itemQty} onChange={e => setItemQty(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                    placeholder="e.g. 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit <span className="text-coral">*</span></label>
                  <input required type="text" value={itemUnit} onChange={e => setItemUnit(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                    placeholder="e.g. kg, L, pcs" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Daily Requirement <span className="text-coral">*</span></label>
                <input required type="number" min="0" step="any" value={itemDailyReq} onChange={e => setItemDailyReq(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                  placeholder="e.g. 15" />
                <p className="text-xs text-muted-foreground mt-1.5">How much is needed for a restaurant in a day. This determines stock status.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsInventoryModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 btn-primary py-2 text-sm">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Add Custom Vendor</h2>
              <button 
                onClick={() => setIsAddVendorModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vendor Name <span className="text-coral">*</span></label>
                <input required type="text" value={vendorName} onChange={e => setVendorName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                  placeholder="e.g. Pune Fresh Supplies" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Item Categories <span className="text-coral">*</span></label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20">
                  {CATEGORIES.map(c => {
                    const isSelected = vendorCategories.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setVendorCategories(vendorCategories.filter(cat => cat !== c));
                          } else {
                            setVendorCategories([...vendorCategories, c]);
                          }
                        }}
                        className={`text-[10px] px-2 py-1.5 rounded-md text-left transition-colors border ${
                          isSelected 
                            ? 'bg-accent text-accent-foreground border-accent' 
                            : 'bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Select all that apply</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number <span className="text-coral">*</span></label>
                <input required type="tel" value={vendorPhone} onChange={e => setVendorPhone(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                  placeholder="+91-1234567890" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddVendorModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 btn-primary py-2 text-sm">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
