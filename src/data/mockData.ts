export const statsData = {
  revenueRecovered: 12480,
  co2Saved: 247,
  inventoryEfficiency: 84,
  treesEquivalent: 12,
  weeklyTrend: { revenue: 18, efficiency: 6 },
};

export const chartData = [
  { day: "Mon", sales: 28400, waste: 3800 },
  { day: "Tue", sales: 32100, waste: 4200 },
  { day: "Wed", sales: 29800, waste: 3100 },
  { day: "Thu", sales: 38500, waste: 5200 },
  { day: "Fri", sales: 44200, waste: 4800 },
  { day: "Sat", sales: 52100, waste: 3900 },
  { day: "Sun", sales: 48300, waste: 4100 },
  { day: "Mon2", sales: 31200, waste: 3600 },
  { day: "Tue2", sales: 33800, waste: 4400 },
  { day: "Wed2", sales: 30100, waste: 2900 },
  { day: "Thu2", sales: 41200, waste: 4600 },
  { day: "Fri2", sales: 46800, waste: 3800 },
  { day: "Sat2", sales: 55400, waste: 3200 },
  { day: "Sun2", sales: 49200, waste: 3700 },
];

export interface Supplier {
  id: number;
  supplier: string;
  itemCategories: string[];
  contactNumber: string;
  qty: string;
  expected: string;
  status: "pending" | "sent" | "error";
  location: string;
  operatingDays: string;
  operationalTime: string;
  returnPolicy: string;
  paymentTerms: string;
  isCustom?: boolean;
  isSelected?: boolean;
}

export const suppliers: Supplier[] = [
  { id: 1, supplier: "Fresh Farms", itemCategories: ["Fruits and Vegetables"], contactNumber: "+91-9876543210", qty: "20 kg", expected: "Tomorrow", status: "pending", location: "Market Yard, Pune", operatingDays: "Mon-Sat", operationalTime: "6:00 AM - 4:00 PM", returnPolicy: "24h for perishables", paymentTerms: "Net 15" },
  { id: 2, supplier: "Dairy Co.", itemCategories: ["Dairy"], contactNumber: "+91-9876543211", qty: "5 L", expected: "Today", status: "sent", location: "Hadapsar, Pune", operatingDays: "Daily", operationalTime: "4:00 AM - 8:00 PM", returnPolicy: "Immediate on delivery", paymentTerms: "Weekly" },
  { id: 3, supplier: "Spice Hub", itemCategories: ["Masala, Salt and Sugar"], contactNumber: "+91-9876543212", qty: "500 g", expected: "3 days", status: "error", location: "Kothrud, Pune", operatingDays: "Mon-Fri", operationalTime: "10:00 AM - 6:00 PM", returnPolicy: "7 days for sealed packs", paymentTerms: "Net 30" },
  { id: 4, supplier: "Poultry Pride", itemCategories: ["Chicken and Eggs"], contactNumber: "+91-9876543213", qty: "10 kg", expected: "Tomorrow", status: "sent", location: "Wakad, Pune", operatingDays: "Daily", operationalTime: "5:00 AM - 12:00 PM", returnPolicy: "No returns for fresh poultry", paymentTerms: "COD" },
  { id: 5, supplier: "Sauce Masters", itemCategories: ["Sauces and Seasoning"], contactNumber: "+91-9876543214", qty: "5 L", expected: "Today", status: "pending", location: "Viman Nagar, Pune", operatingDays: "Mon-Sat", operationalTime: "9:00 AM - 7:00 PM", returnPolicy: "15 days for damage", paymentTerms: "Net 15" },
  { id: 6, supplier: "PackPro", itemCategories: ["Packaging Material"], contactNumber: "+91-9876543215", qty: "1000 pcs", expected: "2 days", status: "sent", location: "Chakan MIDC", operatingDays: "Mon-Fri", operationalTime: "9:00 AM - 6:00 PM", returnPolicy: "30 days for bulk defects", paymentTerms: "Monthly" },
  { id: 7, supplier: "Global Foods", itemCategories: ["Canned and Imported Items", "Sauces and Seasoning"], contactNumber: "+91-9876543216", qty: "10 tins", expected: "Next Week", status: "pending", location: "Mumbai Port Trust", operatingDays: "Mon-Sat", operationalTime: "10:00 AM - 8:00 PM", returnPolicy: "Imported items: 10 days", paymentTerms: "Advance 50%" },
  { id: 8, supplier: "Pure Oils", itemCategories: ["Edible Oils"], contactNumber: "+91-9876543217", qty: "15 L", expected: "Tomorrow", status: "sent", location: "Sangli Road", operatingDays: "Mon-Sat", operationalTime: "8:00 AM - 5:00 PM", returnPolicy: "Seal broken: No return", paymentTerms: "Net 15" },
  { id: 9, supplier: "Frosty Bites", itemCategories: ["Frozen and Instant Food", "Bakery and Chocolates"], contactNumber: "+91-9876543218", qty: "12 pkts", expected: "Today", status: "error", location: "Pimpri, Pune", operatingDays: "Daily", operationalTime: "8:00 AM - 10:00 PM", returnPolicy: "Defrosting: Claim in 2h", paymentTerms: "Weekly" },
  { id: 10, supplier: "BakeHouse", itemCategories: ["Bakery and Chocolates"], contactNumber: "+91-9876543219", qty: "20 loaves", expected: "Tomorrow", status: "sent", location: "Camp, Pune", operatingDays: "Mon-Sat", operationalTime: "7:00 AM - 9:00 PM", returnPolicy: "Same day for freshness", paymentTerms: "Net 7" },
  { id: 11, supplier: "Golden Mills", itemCategories: ["Flours"], contactNumber: "+91-9876543220", qty: "50 kg", expected: "3 days", status: "pending", location: "Marketyard, Gultekdi", operatingDays: "Mon-Sat", operationalTime: "8:00 AM - 6:00 PM", returnPolicy: "Moisture damage: 48h", paymentTerms: "Net 30" },
  { id: 12, supplier: "Pulse Point", itemCategories: ["Pulses"], contactNumber: "+91-9876543221", qty: "30 kg", expected: "Tomorrow", status: "sent", location: "Latur Grain Market", operatingDays: "Mon-Fri", operationalTime: "9:00 AM - 5:00 PM", returnPolicy: "Sieved/Cleaned: 7 days", paymentTerms: "Monthly" },
  { id: 13, supplier: "Mixer Magic", itemCategories: ["Beverages and Mixers"], contactNumber: "+91-9876543222", qty: "5 crates", expected: "Today", status: "pending", location: "Kharadi, Pune", operatingDays: "Daily", operationalTime: "10:00 AM - 10:00 PM", returnPolicy: "Breakage during transport", paymentTerms: "Weekly" },
  { id: 14, supplier: "NutriNuts", itemCategories: ["Dry Fruits and Nuts"], contactNumber: "+91-9876543223", qty: "2 kg", expected: "Next Week", status: "sent", location: "Bhavani Peth", operatingDays: "Mon-Sat", operationalTime: "11:00 AM - 7:00 PM", returnPolicy: "Quality check at delivery", paymentTerms: "COD" },
  { id: 15, supplier: "Rice King", itemCategories: ["Rice and Rice Products"], contactNumber: "+91-9876543224", qty: "100 kg", expected: "Tomorrow", status: "pending", location: "Gondia, MH", operatingDays: "Mon-Fri", operationalTime: "9:00 AM - 6:00 PM", returnPolicy: "Bulk return: 15 days", paymentTerms: "Net 45" },
  { id: 16, supplier: "Meat Masters", itemCategories: ["Mutton, Duck and Lamb"], contactNumber: "+91-9876543225", qty: "15 kg", expected: "Today", status: "sent", location: "Deonar, Mumbai", operatingDays: "Daily", operationalTime: "4:00 AM - 12:00 PM", returnPolicy: "Cold chain break: Same day", paymentTerms: "Daily" },
  { id: 17, supplier: "Coastal Catch", itemCategories: ["Fish, Prawns and Seafood"], contactNumber: "+91-9876543226", qty: "8 kg", expected: "Tomorrow", status: "error", location: "Sasoon Dock", operatingDays: "Daily", operationalTime: "3:00 AM - 10:00 AM", returnPolicy: "Immediate quality check", paymentTerms: "Daily" }
];

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  minThreshold: number;
}

export const initialInventory: InventoryItem[] = [
  { id: 1, name: "Tomatoes", category: "Fruits and Vegetables", quantity: 45, unit: "kg", status: "In Stock", minThreshold: 15 },
  { id: 2, name: "Potatoes", category: "Fruits and Vegetables", quantity: 18, unit: "kg", status: "Low Stock", minThreshold: 20 },
  { id: 3, name: "Onions", category: "Fruits and Vegetables", quantity: 60, unit: "kg", status: "In Stock", minThreshold: 25 },
  { id: 4, name: "Milk (Full Cream)", category: "Dairy", quantity: 12, unit: "L", status: "Low Stock", minThreshold: 15 },
  { id: 5, name: "Paneer", category: "Dairy", quantity: 0, unit: "kg", status: "Out of Stock", minThreshold: 5 },
  { id: 6, name: "Salt", category: "Masala, Salt and Sugar", quantity: 10, unit: "kg", status: "In Stock", minThreshold: 2 },
  { id: 7, name: "Eggs", category: "Chicken and Eggs", quantity: 240, unit: "pcs", status: "In Stock", minThreshold: 50 },
  { id: 8, name: "Chicken Breast", category: "Chicken and Eggs", quantity: 4, unit: "kg", status: "Low Stock", minThreshold: 10 },
  { id: 9, name: "Soy Sauce", category: "Sauces and Seasoning", quantity: 8, unit: "L", status: "In Stock", minThreshold: 3 },
  { id: 10, name: "Takeaway Boxes", category: "Packaging Material", quantity: 150, unit: "pcs", status: "Low Stock", minThreshold: 200 },
  { id: 11, name: "Canned Tomatoes", category: "Canned and Imported Items", quantity: 24, unit: "tins", status: "In Stock", minThreshold: 10 },
  { id: 12, name: "Sunflower Oil", category: "Edible Oils", quantity: 45, unit: "L", status: "In Stock", minThreshold: 15 },
  { id: 13, name: "Frozen Peas", category: "Frozen and Instant Food", quantity: 0, unit: "kg", status: "Out of Stock", minThreshold: 5 },
  { id: 14, name: "Basmati Rice", category: "Rice and Rice Products", quantity: 85, unit: "kg", status: "In Stock", minThreshold: 25 },
  { id: 15, name: "Wheat Flour", category: "Flours", quantity: 40, unit: "kg", status: "In Stock", minThreshold: 20 },
];

export interface PrepItem {
  id: number;
  name: string;
  icon: string;
  target: number;
  usual: number;
  prepped: number;
  aiTag: { type: string; label: string; color: string } | null;
  expiryAlert?: boolean;
  stock?: string;
}

export const prepItems: PrepItem[] = [
  { id: 1, name: "Chicken Biryani", icon: "🍛", target: 48, usual: 40, prepped: 38,
    aiTag: { type: "event", label: "Prep +20% — Event Nearby", color: "amber" } },
  { id: 2, name: "Masala Dosa", icon: "🥞", target: 60, usual: 60, prepped: 60,
    aiTag: null },
  { id: 3, name: "Paneer Tikka", icon: "🧀", target: 30, usual: 30, prepped: 12,
    aiTag: { type: "expiry", label: "Expiry: 2 days — Use Today!", color: "red" },
    expiryAlert: true, stock: "3.2 kg" },
  { id: 4, name: "Dal Makhani", icon: "🍲", target: 34, usual: 40, prepped: 20,
    aiTag: { type: "weather", label: "Reduce -15% — Rain Forecast", color: "blue" } },
  { id: 5, name: "Gulab Jamun", icon: "🍮", target: 56, usual: 40, prepped: 30,
    aiTag: { type: "peak", label: "Prep +40% — Weekend Peak", color: "green" } },
  { id: 6, name: "Filter Coffee", icon: "☕", target: 100, usual: 80, prepped: 65,
    aiTag: { type: "peak", label: "Prep +25% — Morning Rush", color: "green" } },
];

export interface FlashSaleItem {
  id: number;
  name: string;
  originalPrice: number;
  salePrice: number;
  stock: string;
  endsIn: number;
  co2Saved: number;
}

export const flashSales: FlashSaleItem[] = [
  { id: 1, name: "Paneer Tikka", originalPrice: 180, salePrice: 120, stock: "3.2 kg", endsIn: 1427, co2Saved: 0.8 },
  { id: 2, name: "Gulab Jamun", originalPrice: 80, salePrice: 50, stock: "24 pcs", endsIn: 2380, co2Saved: 0.3 },
  { id: 3, name: "Dal Makhani", originalPrice: 220, salePrice: 150, stock: "4 portions", endsIn: 580, co2Saved: 1.1 },
];

export interface TableData {
  id: string;
  capacity: number;
  status: "available" | "occupied" | "preorder" | "reserved" | "cleaning";
  timeSeated?: number;
  course?: number;
  reservationTime?: string;
  guestName?: string;
  eta?: number;
  distanceMeters?: number;
  preOrderItems?: string[];
}

export const tables: TableData[] = [
  { id: "T-01", capacity: 4, status: "available" },
  { id: "T-02", capacity: 2, status: "occupied", timeSeated: 38, course: 2 },
  { id: "T-03", capacity: 6, status: "available" },
  { id: "T-04", capacity: 4, status: "occupied", timeSeated: 12, course: 1 },
  { id: "T-05", capacity: 2, status: "available" },
  { id: "T-06", capacity: 4, status: "reserved", reservationTime: "19:30" },
  { id: "T-07", capacity: 4, status: "available" },
  { id: "T-08", capacity: 4, status: "preorder", guestName: "Ananya K.", eta: 3, distanceMeters: 280, preOrderItems: ["Masala Dosa", "Filter Coffee ×2"] },
  { id: "T-09", capacity: 3, status: "occupied", timeSeated: 55, course: 2 },
  { id: "T-10", capacity: 2, status: "cleaning" },
  { id: "T-11", capacity: 8, status: "available" },
  { id: "T-12", capacity: 4, status: "preorder", guestName: "Rahul S.", eta: 4, distanceMeters: 400, preOrderItems: ["Butter Chicken", "Naan ×2", "Lassi"] },
  { id: "T-13", capacity: 2, status: "occupied", timeSeated: 8, course: 1 },
  { id: "T-14", capacity: 4, status: "available" },
  { id: "T-15", capacity: 2, status: "available" },
  { id: "T-16", capacity: 4, status: "occupied", timeSeated: 27, course: 2 },
  { id: "T-17", capacity: 4, status: "available" },
  { id: "T-18", capacity: 6, status: "reserved", reservationTime: "20:00" },
  { id: "T-19", capacity: 2, status: "available" },
  { id: "T-20", capacity: 6, status: "occupied", timeSeated: 44, course: 3 },
];

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  ecoScore: number;
  veg: boolean;
  desc: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    name: "Starters",
    items: [
      { id: 1, name: "Paneer Tikka", price: 180, ecoScore: 4, veg: true, desc: "Smoky cottage cheese skewers" },
      { id: 2, name: "Chicken 65", price: 220, ecoScore: 3, veg: false, desc: "Spiced crispy fried chicken" },
      { id: 3, name: "Veg Sampler", price: 160, ecoScore: 5, veg: true, desc: "Chef's seasonal vegetable selection" },
    ],
  },
  {
    name: "Mains",
    items: [
      { id: 4, name: "Chicken Biryani", price: 320, ecoScore: 3, veg: false, desc: "Aromatic basmati with tender chicken" },
      { id: 5, name: "Dal Makhani", price: 220, ecoScore: 5, veg: true, desc: "Slow-cooked black lentil perfection" },
      { id: 6, name: "Paneer Butter Masala", price: 260, ecoScore: 4, veg: true, desc: "Rich tomato-cream curry" },
    ],
  },
  {
    name: "Desserts",
    items: [
      { id: 7, name: "Gulab Jamun", price: 80, ecoScore: 4, veg: true, desc: "Soft milk-solid dumplings in rose syrup" },
      { id: 8, name: "Kulfi", price: 100, ecoScore: 5, veg: true, desc: "Traditional frozen milk dessert" },
    ],
  },
];

export interface Notification {
  id: number;
  type: "preorder" | "table" | "ready" | "complaint";
  color: string;
  title: string;
  message: string;
  action: string;
}

export const notifications: Notification[] = [
  { id: 1, type: "preorder", color: "#457B9D", title: "PRE-ORDER ALERT", message: "T-12: Rahul S. is 400m away — ETA 4 min", action: "Prepare Kitchen" },
  { id: 2, type: "table", color: "#F4A261", title: "TABLE ALERT", message: "T-09 — 55 min seated, still on main course", action: "Check Table" },
  { id: 3, type: "ready", color: "#74C69D", title: "TABLE READY", message: "T-05 cleaned and available", action: "Confirm" },
  { id: 4, type: "complaint", color: "#E76F51", title: "ISSUE FLAGGED", message: "T-04 — Guest complaint logged", action: "View Details" },
];
