import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Map, ChefHat, Package, Recycle, BarChart3, Settings,
  TrendingUp, Leaf, Truck, Plus, Check, X, ChevronRight, ChevronDown, Save, AlertTriangle, AlertCircle, Edit2, ShoppingCart, Trash2, Users
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useDashboardAnalytics, useSalesVsWasteChart } from "@/hooks/useAnalytics";
import { useSuppliers, useInventoryItems } from "@/hooks/useInventory";
import { useCategories, useMenuItems } from "@/hooks/useMenu";
import { floorApi } from "@/api/floor";
import { menuApi } from "@/api/menu";
import { inventoryApi } from "@/api/inventory";
import { useStaffList, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useUsers";

const CATEGORIES = [
  "Fruits and Vegetables", "Dairy", "Masala, Salt and Sugar", "Chicken and Eggs",
  "Sauces and Seasoning", "Packaging Material", "Canned and Imported Items",
  "Edible Oils", "Frozen and Instant Food", "Bakery and Chocolates", "Flours",
  "Pulses", "Beverages and Mixers", "Dry Fruits and Nuts", "Rice and Rice Products",
  "Mutton, Duck and Lamb", "Fish, Prawns and Seafood"
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

interface PurchaseOrder {
  id: string;
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
  supplierName: string;
  status: "pending" | "approved" | "completed";
  date: string;
}

interface SupplierUi {
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

interface InventoryUi {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  dailyRequirement: number;
}

const toSupplierUi = (supplier: any): SupplierUi => {
  const name = supplier?.supplier || supplier?.name || "Unknown Supplier";
  const reliability = Number(supplier?.reliability_score ?? 100);
  let status: SupplierUi["status"] = "pending";
  if (reliability >= 90) status = "sent";
  else if (reliability < 60) status = "error";

  return {
    id: Number(supplier?.id ?? Date.now()),
    supplier: name,
    itemCategories: Array.isArray(supplier?.item_categories) && supplier.item_categories.length > 0 
      ? supplier.item_categories 
      : Array.isArray(supplier?.itemCategories) && supplier.itemCategories.length > 0
      ? supplier.itemCategories
      : ["General"],
    contactNumber: supplier?.contact_number || supplier?.contactNumber || "N/A",
    qty: supplier?.qty || "-",
    expected: supplier?.expected || "-",
    status,
    location: supplier?.location || "N/A",
    operatingDays: supplier?.operatingDays || "N/A",
    operationalTime: supplier?.operationalTime || "N/A",
    returnPolicy: supplier?.returnPolicy || "N/A",
    paymentTerms: supplier?.paymentTerms || "N/A",
    isCustom: !!supplier?.is_custom || !!supplier?.isCustom,
    isSelected: !!supplier?.is_selected || !!supplier?.isSelected,
  };
};

const toInventoryUi = (item: any): InventoryUi => {
  const quantity = Number(item?.quantity ?? 0);
  const dailyRequirement = Number(item?.daily_requirement ?? item?.dailyRequirement ?? 10);
  let status: InventoryUi["status"] = "In Stock";
  if (quantity <= 0) status = "Out of Stock";
  else if (quantity <= dailyRequirement) status = "Low Stock";

  return {
    id: Number(item?.id ?? Date.now()),
    name: item?.name || "Unknown Item",
    category: item?.category || item?.supplier_name || "General",
    quantity,
    unit: item?.unit || "units",
    dailyRequirement,
    status,
  };
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: analyticsData } = useDashboardAnalytics();
  const { data: chartDataApi } = useSalesVsWasteChart();
  const { data: suppliersApi } = useSuppliers();
  const { data: inventoryItemsApi } = useInventoryItems();
  const { data: menuCategoriesApi = [] } = useCategories();
  const { data: menuItemsApi = [] } = useMenuItems();
  const { data: staffListApi } = useStaffList();
  
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const statsData = analyticsData || { revenueRecovered: 0, co2Saved: 0, inventoryEfficiency: 0, treesEquivalent: 0 };
  const chartData = chartDataApi || [];
  const initialSuppliers: SupplierUi[] = Array.isArray(suppliersApi) ? suppliersApi.map(toSupplierUi) : [];
  const initialInventory: InventoryUi[] = Array.isArray(inventoryItemsApi) ? inventoryItemsApi.map(toInventoryUi) : [];

  const revenue = useCountUp(statsData.revenueRecovered);
  const co2 = useCountUp(statsData.co2Saved);
  const efficiency = useCountUp(statsData.inventoryEfficiency);
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get("view") ?? "dashboard";
  const { setUserRole } = useApp();
  const [suppliersList, setSuppliersList] = useState<SupplierUi[]>(initialSuppliers);
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffEditingId, setStaffEditingId] = useState<number | null>(null);
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<"chef" | "waiter">("waiter");

  // Add Vendor Modal State
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [vendorPhone, setVendorPhone] = useState("");

  // Global object creation modals
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState<number | string>(4);
  const [tableStatus, setTableStatus] = useState("available");

  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [dishName, setDishName] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishCategoryId, setDishCategoryId] = useState<number | "">("");
  const [dishPrice, setDishPrice] = useState<number | string>("");
  const [dishEcoScore, setDishEcoScore] = useState<number | string>(5);
  const [dishIsVegan, setDishIsVegan] = useState(false);
  const [dishNewCategory, setDishNewCategory] = useState("");

  const [isAddPrepModalOpen, setIsAddPrepModalOpen] = useState(false);
  const [prepName, setPrepName] = useState("");
  const [prepQuantity, setPrepQuantity] = useState<number | string>("");
  const [prepUnit, setPrepUnit] = useState("kg");
  const [prepExpiryDate, setPrepExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Menu registry modal state
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<number | null>(null);
  const [menuItemName, setMenuItemName] = useState("");
  const [menuItemDescription, setMenuItemDescription] = useState("");
  const [menuItemCategoryId, setMenuItemCategoryId] = useState<number | "">("");
  const [menuItemNewCategory, setMenuItemNewCategory] = useState("");
  const [menuItemBasePrice, setMenuItemBasePrice] = useState<number | string>("");
  const [menuItemDiscountPrice, setMenuItemDiscountPrice] = useState<number | string>("");
  const [menuItemEcoScore, setMenuItemEcoScore] = useState<number | string>(5);
  const [menuItemIsVegan, setMenuItemIsVegan] = useState(false);
  const [menuItemImage, setMenuItemImage] = useState<File | null>(null);

  // Inventory State
  const [inventoryList, setInventoryList] = useState<InventoryUi[]>(initialInventory);
  
  // Sync when API data loads
  useEffect(() => {
    setSuppliersList(initialSuppliers);
  }, [suppliersApi]);

  useEffect(() => {
    setInventoryList(initialInventory);
  }, [inventoryItemsApi]);

  // Inventory Setup Modal State
  const openStaffModal = (staff?: any) => {
    if (staff) {
      setStaffEditingId(staff.id);
      setStaffUsername(staff.username);
      setStaffPassword("");
      setStaffRole(staff.role as any);
    } else {
      setStaffEditingId(null);
      setStaffUsername("");
      setStaffPassword("");
      setStaffRole("waiter");
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (staffEditingId) {
        await updateStaff.mutateAsync({
          id: staffEditingId,
          data: { username: staffUsername, password: staffPassword || undefined, role: staffRole }
        });
        toast.success("Staff member updated");
      } else {
        if (!staffPassword) {
           toast.error("Password is required for new staff");
           return;
        }
        await createStaff.mutateAsync({
          username: staffUsername, password: staffPassword, role: staffRole
        });
        toast.success("Staff member created");
      }
      setIsStaffModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save staff member");
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      try {
        await deleteStaff.mutateAsync(id);
        toast.success("Staff member removed");
      } catch (err: any) {
        toast.error("Failed to remove staff member");
      }
    }
  };

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  // inventory item form
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState(CATEGORIES[0]);
  const [itemQty, setItemQty] = useState<number | string>("");
  const [itemUnit, setItemUnit] = useState("kg");
  const [itemDailyReq, setItemDailyReq] = useState<number | string>("");

  // Purchase Order State
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handleUpdateOrderStatus = (orderId: string, newStatus: "approved" | "completed") => {
    setPurchaseOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        if (newStatus === "completed" && order.status !== "completed") {
          setInventoryList(invList => invList.map(item => {
            if (item.id === order.itemId) {
              const newQty = item.quantity + order.quantity;
              let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
              if (newQty <= 0) status = "Out of Stock";
              else if (newQty <= item.dailyRequirement) status = "Low Stock";
              return { ...item, quantity: newQty, status };
            }
            return item;
          }));
          toast.success(`${order.itemName} stock updated by ${order.quantity} ${order.unit}`);
        } else {
           toast.success(`Order ${orderId} marked as ${newStatus}`);
        }
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };
  const [purchaseItem, setPurchaseItem] = useState<InventoryUi | null>(null);
  const [purchaseQty, setPurchaseQty] = useState<number | string>("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | "">("");

  const [fetchedSuppliers, setFetchedSuppliers] = useState<SupplierUi[]>([]);

  useEffect(() => {
    setFetchedSuppliers(suppliersList);
  }, [suppliersList]);

  const openPurchaseModal = (item: InventoryUi) => {
    setPurchaseItem(item);
    setPurchaseQty("");
    // Find a selected supplier that supplies this category from fetched backend list
    const matchingSupplier = fetchedSuppliers.find(s => (s.itemCategories || []).includes(item.category) && s.isSelected);
    setSelectedSupplierId(matchingSupplier ? matchingSupplier.id : "");
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseItem) return;
    const qty = Number(purchaseQty) || 0;
    
    const supplierName = fetchedSuppliers.find(s => s.id === Number(selectedSupplierId))?.supplier || "Custom Supplier";

    const newOrder: PurchaseOrder = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId: purchaseItem.id,
      itemName: purchaseItem.name,
      quantity: qty,
      unit: purchaseItem.unit,
      supplierName,
      status: "pending",
      date: new Date().toLocaleDateString("en-GB")
    };
    
    setPurchaseOrders(prev => [newOrder, ...prev]);

    toast.success(`Purchase order for ${qty} ${purchaseItem.unit} of ${purchaseItem.name} generated`);
    setIsPurchaseModalOpen(false);
    setPurchaseItem(null);
  };
  // Extra duplicate lines removed

  const openInventoryModal = (item?: InventoryUi) => {
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

  const handleSaveInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(itemQty) || 0;
    const dailyReq = Number(itemDailyReq) || 0;
    
    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (qty <= 0) status = "Out of Stock";
    else if (qty <= dailyReq) status = "Low Stock";

    try {
      if (editingItemId) {
        await inventoryApi.updateItem(editingItemId, {
          name: itemName,
          category: itemCategory,
          quantity: qty,
          unit: itemUnit,
          daily_requirement: dailyReq,
        });
        toast.success("Inventory item updated");
      } else {
        await inventoryApi.createItem({
          name: itemName,
          category: itemCategory,
          quantity: qty,
          unit: itemUnit,
          daily_requirement: dailyReq,
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        toast.success("Inventory item added");
      }
      await queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      setIsInventoryModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save inventory item");
    }
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
  };

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

  const deleteSupplier = async (id: number) => {
    try {
      await inventoryApi.deleteSupplier(id);
      setSuppliersList(prev => prev.filter(s => s.id !== id));
      await queryClient.invalidateQueries({ queryKey: ["inventory", "suppliers"] });
      toast.success("Supplier removed");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete supplier");
    }
  };

  const toggleSupplierSelect = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetSupplier = suppliersList.find(s => s.id === id);
    if (!targetSupplier) return;
    const newIsSelected = !targetSupplier.isSelected;

    setSuppliersList(prev => prev.map(s => {
      if (s.id === id) {
        if (newIsSelected) toast.success(`${s.supplier} added to Selected Suppliers`);
        return { ...s, isSelected: newIsSelected };
      }
      return s;
    }));

    try {
      await inventoryApi.updateSupplier(id, { is_selected: newIsSelected });
      await queryClient.invalidateQueries({ queryKey: ["inventory", "suppliers"] });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update supplier preference");
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.createSupplier({
        name: vendorName,
        contact_number: vendorPhone,
        item_categories: vendorCategories,
        is_custom: true,
      });

      await queryClient.invalidateQueries({ queryKey: ["inventory", "suppliers"] });
      setIsAddVendorModalOpen(false);
      setVendorName("");
      setVendorPhone("");
      setVendorCategories([]);
      toast.success("Vendor added successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add vendor");
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await floorApi.createTable({
        name: tableName.trim(),
        capacity: Number(tableCapacity),
        status: tableStatus,
      });

      await queryClient.invalidateQueries({ queryKey: ["floor", "tables"] });
      toast.success("Table created successfully");
      setIsAddTableModalOpen(false);
      setTableName("");
      setTableCapacity(4);
      setTableStatus("available");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create table");
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let categoryId = Number(dishCategoryId);

      if (dishNewCategory.trim()) {
        const createdCategory = await menuApi.createCategory({ name: dishNewCategory.trim() });
        categoryId = createdCategory.id;
      }

      if (!categoryId) {
        toast.error("Please select or create a category");
        return;
      }

      await menuApi.createItem({
        name: dishName.trim(),
        description: dishDescription.trim(),
        category: categoryId,
        base_price: Number(dishPrice),
        eco_score: Number(dishEcoScore) || 5,
        is_vegan: dishIsVegan,
      });

      await queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      toast.success("Dish created successfully");
      setIsAddDishModalOpen(false);
      setDishName("");
      setDishDescription("");
      setDishCategoryId("");
      setDishPrice("");
      setDishEcoScore(5);
      setDishIsVegan(false);
      setDishNewCategory("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create dish");
    }
  };

  const handleAddPrepItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.createItem({
        name: prepName.trim(),
        quantity: Number(prepQuantity),
        unit: prepUnit,
        expiry_date: prepExpiryDate,
      });

      await queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      toast.success("Preparation item created successfully");
      setIsAddPrepModalOpen(false);
      setPrepName("");
      setPrepQuantity("");
      setPrepUnit("kg");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create preparation item");
    }
  };

  const openMenuItemModal = (item?: any) => {
    if (item) {
      setEditingMenuItemId(Number(item.id));
      setMenuItemName(item.name || "");
      setMenuItemDescription(item.description || "");
      setMenuItemCategoryId(Number(item.category) || "");
      setMenuItemNewCategory("");
      setMenuItemBasePrice(String(Number(item.base_price ?? item.price ?? 0)));
      setMenuItemDiscountPrice(item.discount_price != null ? String(Number(item.discount_price)) : "");
      setMenuItemEcoScore(String(Number(item.eco_score ?? 5)));
      setMenuItemIsVegan(!!item.is_vegan);
    } else {
      setEditingMenuItemId(null);
      setMenuItemName("");
      setMenuItemDescription("");
      setMenuItemCategoryId("");
      setMenuItemNewCategory("");
      setMenuItemBasePrice("");
      setMenuItemDiscountPrice("");
      setMenuItemEcoScore(5);
      setMenuItemIsVegan(false);
      setMenuItemImage(null);
    }
    setIsMenuItemModalOpen(true);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let categoryId = Number(menuItemCategoryId);
      if (menuItemNewCategory.trim()) {
        const createdCategory = await menuApi.createCategory({ name: menuItemNewCategory.trim() });
        categoryId = Number(createdCategory.id);
      }

      if (!categoryId) {
        toast.error("Please select or create a category");
        return;
      }

      const basePayload = {
        name: menuItemName.trim(),
        description: menuItemDescription.trim(),
        category: categoryId,
        base_price: Number(menuItemBasePrice),
        discount_price: menuItemDiscountPrice === "" ? null : Number(menuItemDiscountPrice),
        eco_score: Number(menuItemEcoScore) || 5,
        is_vegan: menuItemIsVegan,
      };

      let finalPayload: any = basePayload;
      if (menuItemImage) {
        finalPayload = new FormData();
        Object.entries(basePayload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            finalPayload.append(key, value);
          }
        });
        finalPayload.append("image", menuItemImage);
      }

      if (editingMenuItemId) {
        await menuApi.updateItem(editingMenuItemId, finalPayload);
        toast.success("Menu item updated");
      } else {
        await menuApi.createItem(finalPayload);
        toast.success("Menu item created");
      }

      await queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      await queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      setIsMenuItemModalOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save menu item");
    }
  };

  const handleDeleteMenuItem = async (itemId: number, itemName: string) => {
    try {
      await menuApi.deleteItem(itemId);
      await queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      toast.success(`${itemName} removed from menu`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete menu item");
    }
  };

  const renderStaff = () => {
    const staffMembers = Array.isArray(staffListApi) ? staffListApi.filter(u => u.role === "chef" || u.role === "waiter") : [];

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Staff Management</h1>
            <p className="text-sm text-muted-foreground">Add and manage restaurant workers</p>
          </div>
          <button onClick={() => openStaffModal()} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Worker
          </button>
        </div>

        <div className="card-dineflow overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((user: any) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${user.role === 'chef' ? 'bg-coral/15 text-coral' : 'bg-steel/15 text-steel'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => openStaffModal(user)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteStaff(user.id)} className="p-1.5 text-coral hover:text-coral hover:bg-coral/10 rounded-md transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {staffMembers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMenuRegistry = () => {
    const menuItems = Array.isArray(menuItemsApi) ? menuItemsApi : [];

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Menu Registry</h1>
            <p className="text-sm text-muted-foreground">Add, edit, and remove dishes from your live menu</p>
          </div>
          <button onClick={() => openMenuItemModal()} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Menu Item
          </button>
        </div>

        <div className="card-dineflow overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                <th className="px-6 py-4 font-medium">Dish</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Eco</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item: any) => {
                const basePrice = Number(item.base_price ?? item.price ?? 0);
                const discountPrice = item.discount_price != null ? Number(item.discount_price) : null;

                return (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md shrink-0 overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
                          {item.image || item.image_url ? (
                            <img src={item.image || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm">{item.is_vegan ? "🥬" : "🍗"}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[320px]">{item.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.category_name || `#${item.category}`}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">₹{basePrice}</span>
                      {discountPrice != null && (
                        <span className="text-xs text-muted-foreground ml-2">Flash ₹{discountPrice}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{Number(item.eco_score ?? 0)}/10</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${item.is_vegan ? "bg-mint/15 text-mint" : "bg-amber/15 text-amber"}`}>
                        {item.is_vegan ? "Veg" : "Non-Veg"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button
                        onClick={() => openMenuItemModal(item)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        title="Edit Menu Item"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(Number(item.id), item.name || "Item")}
                        className="p-1.5 text-coral hover:text-coral hover:bg-coral/10 rounded-md transition-colors"
                        title="Delete Menu Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Admin › Dashboard</p>
          <h1 className="font-display text-2xl">Strategy Dashboard</h1>
          <p className="text-sm text-muted-foreground">Saturday, 28 March 2026 · The Green Table</p>
        </div>
        <span className="badge-pill bg-accent/10 text-accent border border-accent/20">🛡 Admin</span>
      </div>

      <div className="card-dineflow p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Quick Add:</span>
          <button onClick={() => setIsAddTableModalOpen(true)} className="btn-primary text-xs px-3 py-1.5">+ Table</button>
          <button onClick={() => setIsAddDishModalOpen(true)} className="btn-primary text-xs px-3 py-1.5">+ Dish</button>
          <button onClick={() => setIsAddPrepModalOpen(true)} className="btn-primary text-xs px-3 py-1.5">+ Preparation Item</button>
        </div>
      </div>

      {/* Stats Grid with left border stripes */}
      <div className="grid grid-cols-3 gap-6">
        <div className="card-dineflow-stripe stat-stripe-green p-6 animate-count-up">
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

        <div className="card-dineflow-stripe stat-stripe-mint p-6 animate-count-up" style={{ animationDelay: "0.1s" }}>
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

        <div className="card-dineflow-stripe stat-stripe-steel p-6 animate-count-up" style={{ animationDelay: "0.2s" }}>
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
          <div className="space-y-2.5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border/60 shadow-sm">
                  <span className="text-base leading-none">{ins.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug text-foreground/90">{ins.text}</p>
                </div>
                <button className="btn-primary text-[10px] px-2 py-1 shrink-0"
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
                    <span className="truncate max-w-[120px]" title={s.supplier || "Unknown Supplier"}>{s.supplier || "Unknown Supplier"}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={(s.itemCategories || []).join(', ')}>
                    {(s.itemCategories || []).join(', ') || "General"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{s.contactNumber || "N/A"}</td>
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
    const regionalSuppliers = suppliersList.filter(
      (s) => !s.isSelected && !s.isCustom && (
        restaurantLocation === "All" || (s.location || "").toLowerCase().includes(restaurantLocation.toLowerCase())
      )
    );

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

  const renderOrdersTable = (list: PurchaseOrder[], title: string, statusConfig: { showAction: boolean }) => (
    <div className="mb-6">
      <h3 className="font-display text-lg mb-3">{title}</h3>
      <div className="card-dineflow overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
              <th className="px-6 py-4 font-medium">Order ID / Date</th>
              <th className="px-6 py-4 font-medium">Item & Qty</th>
              <th className="px-6 py-4 font-medium">Supplier</th>
              <th className="px-6 py-4 font-medium">Status</th>
              {statusConfig.showAction && <th className="px-6 py-4 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <span>{order.id}</span>
                  <p className="text-xs text-muted-foreground font-normal">{order.date}</p>
                </td>
                <td className="px-6 py-4">
                  <span>{order.itemName}</span>
                  <p className="text-xs text-muted-foreground font-mono">{order.quantity} {order.unit}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{order.supplierName}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                    ${order.status === 'completed' ? 'bg-mint/15 text-mint' : 
                      order.status === 'approved' ? 'bg-accent/15 text-accent' : 'bg-amber/15 text-amber'}`}>
                    {order.status}
                  </span>
                </td>
                {statusConfig.showAction && (
                  <td className="px-6 py-4 flex items-center gap-2">
                    {order.status === "approved" && (
                      <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="text-xs bg-mint text-white hover:bg-mint/90 transition-colors rounded !py-1 !px-2 font-medium">
                        Complete
                      </button>
                    )}
                    {order.status === "completed" && (
                      <span className="text-xs text-muted-foreground"><Check size={14} className="inline mr-1 text-mint"/>Done</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={statusConfig.showAction ? 5 : 4} className="px-6 py-8 text-center text-muted-foreground text-xs">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

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
                  <td className="px-6 py-4 flex items-center gap-2">
                    {item.status !== "In Stock" && (
                      <button 
                        onClick={() => openPurchaseModal(item)}
                        className="p-1.5 text-accent hover:text-accent-foreground hover:bg-accent/20 rounded-md transition-colors"
                        title="Create Purchase Order"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    )}
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

        {/* Purchase Orders Tracker */}
        <div className="mt-8 pt-4 border-t border-border">
          <h2 className="font-display text-xl mb-4">Purchase Orders History</h2>
          
          {renderOrdersTable(purchaseOrders.filter(o => o.status === "pending"), "Pending Orders", { showAction: false })}
          {renderOrdersTable(purchaseOrders.filter(o => o.status === "approved"), "Approved Orders", { showAction: true })}
          {renderOrdersTable(purchaseOrders.filter(o => o.status === "completed"), "Completed Orders", { showAction: false })}
          
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
    <div className="min-h-screen bg-background p-8 pb-16">
      <div className="max-w-6xl mx-auto">
        {currentView === "dashboard" && renderDashboard()}
        {currentView === "menu" && renderMenuRegistry()}
        {currentView === "suppliers" && renderSuppliers()}
        {currentView === "settings" && renderSettings()}
        {currentView === "staff" && renderStaff()}
        {currentView === "inventory" && renderInventory()}
        {currentView !== "dashboard" && currentView !== "menu" && currentView !== "suppliers" && currentView !== "settings" && currentView !== "inventory" && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Module under construction
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Add Table</h2>
              <button onClick={() => setIsAddTableModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Name</label>
                <input required type="text" value={tableName} onChange={(e) => setTableName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  placeholder="e.g. T-21" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input required type="number" min="1" value={tableCapacity} onChange={(e) => setTableCapacity(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={tableStatus} onChange={(e) => setTableStatus(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all">
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="occupied">Occupied</option>
                    <option value="pre-order">Pre-order</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddTableModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2 text-sm">Create Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Add Dish</h2>
              <button onClick={() => setIsAddDishModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddDish} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dish Name</label>
                <input required type="text" value={dishName} onChange={(e) => setDishName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  placeholder="e.g. Paneer Tikka" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={dishDescription} onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  rows={3} placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={dishCategoryId} onChange={(e) => setDishCategoryId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all">
                    <option value="">Select category</option>
                    {Array.isArray(menuCategoriesApi) && menuCategoriesApi.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Category (optional)</label>
                  <input type="text" value={dishNewCategory} onChange={(e) => setDishNewCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    placeholder="Create new category" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input required type="number" min="0" step="0.01" value={dishPrice} onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Eco Score</label>
                  <input required type="number" min="0" max="10" value={dishEcoScore} onChange={(e) => setDishEcoScore(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={dishIsVegan} onChange={(e) => setDishIsVegan(e.target.checked)} />
                    Vegan
                  </label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddDishModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2 text-sm">Create Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Registry Modal */}
      {isMenuItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">{editingMenuItemId ? "Edit Menu Item" : "Add Menu Item"}</h2>
              <button onClick={() => setIsMenuItemModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dish Name</label>
                <input
                  required
                  type="text"
                  value={menuItemName}
                  onChange={(e) => setMenuItemName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={menuItemDescription}
                  onChange={(e) => setMenuItemDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={menuItemCategoryId}
                    onChange={(e) => setMenuItemCategoryId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  >
                    <option value="">Select category</option>
                    {Array.isArray(menuCategoriesApi) && menuCategoriesApi.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Category (optional)</label>
                  <input
                    type="text"
                    value={menuItemNewCategory}
                    onChange={(e) => setMenuItemNewCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    placeholder="Create new category"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuItemBasePrice}
                    onChange={(e) => setMenuItemBasePrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuItemDiscountPrice}
                    onChange={(e) => setMenuItemDiscountPrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Eco Score</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="10"
                    value={menuItemEcoScore}
                    onChange={(e) => setMenuItemEcoScore(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="menu-item-vegan"
                  type="checkbox"
                  checked={menuItemIsVegan}
                  onChange={(e) => setMenuItemIsVegan(e.target.checked)}
                />
                <label htmlFor="menu-item-vegan" className="text-sm">Vegan</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Food Image Upload (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMenuItemImage(e.target.files?.[0] || null)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMenuItemModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2 text-sm">
                  {editingMenuItemId ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Preparation Item Modal */}
      {isAddPrepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Add Preparation Item</h2>
              <button onClick={() => setIsAddPrepModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPrepItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name</label>
                <input required type="text" value={prepName} onChange={(e) => setPrepName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  placeholder="e.g. Tomatoes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input required type="number" min="0" step="0.01" value={prepQuantity} onChange={(e) => setPrepQuantity(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input required type="text" value={prepUnit} onChange={(e) => setPrepUnit(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    placeholder="kg / L / pcs" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input required type="date" value={prepExpiryDate} onChange={(e) => setPrepExpiryDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddPrepModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-2 text-sm">Create Prep Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Setup Modal */}
      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
              <h2 className="font-display text-xl">{staffEditingId ? "Edit Worker" : "Add Worker"}</h2>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Username</label>
                <input
                  type="text"
                  required
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="e.g. chef_john"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
                <input
                  type="password"
                  required={!staffEditingId}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder={staffEditingId ? "(Leave empty to keep current)" : "Create password"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                >
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createStaff.isPending || updateStaff.isPending} className="flex-1 btn-primary py-2.5 flex justify-center items-center">
                  {(createStaff.isPending || updateStaff.isPending) ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : "Save Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Purchase Order Modal */}
      {isPurchaseModalOpen && purchaseItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Create Purchase Order</h2>
              <button 
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePurchaseOrder} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Item Details</p>
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{purchaseItem.name}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      purchaseItem.status === 'Low Stock' ? 'bg-amber/15 text-amber' : 'bg-coral/15 text-coral'
                    }`}>{purchaseItem.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Current Stock: {purchaseItem.quantity} {purchaseItem.unit}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Order Quantity (<span className="text-accent">{purchaseItem.unit}</span>) <span className="text-coral">*</span></label>
                <input required type="number" min="0.1" step="any" value={purchaseQty} onChange={e => setPurchaseQty(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all" 
                  placeholder={`e.g. ${purchaseItem.dailyRequirement * 3}`} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Select Supplier <span className="text-coral">*</span></label>
                <select required value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all">
                  <option value="" disabled>Select a supplier...</option>
                  {fetchedSuppliers.filter(s => (s.itemCategories || []).includes(purchaseItem.category) && s.isSelected).map(c => (
                    <option key={c.id} value={c.id}>{c.supplier}</option>
                  ))}
                  {fetchedSuppliers.filter(s => s.isSelected).length === 0 && (
                    <option disabled>No selected suppliers active. Please toggle vendors in Suppliers tab.</option>
                  )}
                  {fetchedSuppliers.filter(s => s.isSelected).length > 0 && fetchedSuppliers.filter(s => (s.itemCategories || []).includes(purchaseItem.category) && s.isSelected).length === 0 && (
                    <option disabled>No selected suppliers cover the "{purchaseItem.category}" category.</option>
                  )}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2">
                  <ShoppingCart size={16} /> Place Order
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
