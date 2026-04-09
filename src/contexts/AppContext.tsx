import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMe } from "@/hooks/useUsers";
import { getAccessToken, clearSession } from "@/api/auth";

export type UserRole = "admin" | "chef" | "waiter" | "customer" | null;

export interface TableData {
  id: string;
  pk?: number;
  capacity: number;
  status: "available" | "occupied" | "preorder" | "reserved" | "cleaning";
  timeSeated?: number;
  course?: number;
  reservationTime?: string;
  guestName?: string;
  eta?: number;
  distanceMeters?: number;
  preOrderItems?: string[];
  pos_x?: number;
  pos_y?: number;
  shape?: "circle" | "square" | "rectangle" | "diamond";
  section?: "Indoor" | "Outdoor" | "Private Room";
}


export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}


interface AppContextType {
  cart: CartItem[];
  addToCart: (item: { id: number; name: string; price: number }) => void;
  removeFromCart: (id: number) => void;
  updateCartQty: (id: number, qty: number) => void;
  clearCart: () => void;
  ecoPoints: number;
  addEcoPoints: (pts: number) => void;
  tablesState: TableData[];
  setTablesState: React.Dispatch<React.SetStateAction<TableData[]>>;
  resetAllTables: () => void;
  flashSaleActive: Record<number, boolean>;
  toggleFlashSale: (id: number) => void;
  userRole: UserRole;
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  isAuthLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ecoPoints, setEcoPoints] = useState(142);
  const [tablesState, setTablesState] = useState<TableData[]>([]);
  const [flashSaleActive, setFlashSaleActive] = useState<Record<number, boolean>>({ 2: true });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const storedRole = localStorage.getItem('user_role')?.toLowerCase();
    if (storedRole === 'admin' || storedRole === 'chef' || storedRole === 'waiter' || storedRole === 'customer') {
      return storedRole as UserRole;
    }
    return null;
  });

  const accessToken = getAccessToken();
  const tokenExists = !!accessToken;
  const { data: userData, isLoading: isUserLoading, isError } = useMe(tokenExists, accessToken);

  const isAuthLoading = tokenExists && isUserLoading;

  useEffect(() => {
    if (userData && userData.role) {
      const normalizedRole = userData.role.toLowerCase() as UserRole;
      setUserRole(normalizedRole);
      localStorage.setItem('user_role', normalizedRole);
    } else if (isError) {
      clearSession();
      setUserRole(null);
      localStorage.removeItem('user_role');
    }
  }, [userData, isError]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setUserRole(null);
      localStorage.removeItem('user_role');
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const addToCart = (item: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((c) => c.id !== id));

  const updateCartQty = (id: number, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
  };

  const clearCart = () => setCart([]);
  const addEcoPoints = (pts: number) => setEcoPoints((p) => p + pts);

  const resetAllTables = () =>
    setTablesState((prev) => prev.map((t) => ({ ...t, status: "available" as const, timeSeated: undefined, course: undefined, guestName: undefined, eta: undefined, distanceMeters: undefined, reservationTime: undefined, preOrderItems: undefined })));

  const toggleFlashSale = (id: number) =>
    setFlashSaleActive((prev) => ({ ...prev, [id]: !prev[id] }));


  return (
    <AppContext.Provider
      value={{ cart, addToCart, removeFromCart, updateCartQty, clearCart, ecoPoints, addEcoPoints, tablesState, setTablesState, resetAllTables, flashSaleActive, toggleFlashSale, userRole, setUserRole, isAuthLoading }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
