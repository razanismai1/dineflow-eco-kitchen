import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import KitchenPanel from "./pages/KitchenPanel";
import FloorMap from "./pages/FloorMap";
import CustomerMenu from "./pages/CustomerMenu";
import WasteManagement from "./pages/WasteManagement";
import TableQRCodes from "./pages/TableQRCodes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={["admin", "chef"]}><KitchenPanel /></ProtectedRoute>} />
        <Route path="/waste" element={<ProtectedRoute allowedRoles={["admin", "chef"]}><WasteManagement /></ProtectedRoute>} />
        <Route path="/floor" element={<ProtectedRoute allowedRoles={["admin", "waiter"]}><FloorMap /></ProtectedRoute>} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/qr" element={<ProtectedRoute allowedRoles={["admin"]}><TableQRCodes /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
