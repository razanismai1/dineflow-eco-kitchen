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

export const suppliers = [
  { id: 1, supplier: "Fresh Farms", item: "Tomatoes", qty: "20 kg", expected: "Tomorrow", status: "pending" as const },
  { id: 2, supplier: "Dairy Co.", item: "Paneer", qty: "5 kg", expected: "Today", status: "sent" as const },
  { id: 3, supplier: "Spice Hub", item: "Cardamom", qty: "500 g", expected: "3 days", status: "error" as const },
  { id: 4, supplier: "Green Greens", item: "Spinach", qty: "8 kg", expected: "Tomorrow", status: "sent" as const },
  { id: 5, supplier: "Coastal Catch", item: "Prawns", qty: "3 kg", expected: "Today", status: "pending" as const },
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
