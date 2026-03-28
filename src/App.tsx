import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import NavigationPill from "@/components/NavigationPill";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import KitchenPanel from "./pages/KitchenPanel";
import FloorMap from "./pages/FloorMap";
import CustomerMenu from "./pages/CustomerMenu";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/kitchen" element={<KitchenPanel />} />
            <Route path="/floor" element={<FloorMap />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NavigationPill />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
