import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryLayout from "./components/InventoryLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Quotations from "./pages/Quotations";
import NewQuotation from "./pages/NewQuotation";
import CurrentOrders from "./pages/CurrentOrders";
import WorkInProgress from "./pages/WorkInProgress";
import WipForm from "./pages/WipForm";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";
import NewOrder from "./pages/NewOrder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-order" element={<NewOrder />} />

          {/* Inventory Management Routes */}
          <Route
            path="/dashboard"
            element={
              <InventoryLayout>
                <Dashboard />
              </InventoryLayout>
            }
          />
          <Route
            path="/quotations"
            element={
              <InventoryLayout>
                <Quotations />
              </InventoryLayout>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <InventoryLayout>
                <NewQuotation />
              </InventoryLayout>
            }
          />
          <Route
            path="/current-orders"
            element={
              <InventoryLayout>
                <CurrentOrders />
              </InventoryLayout>
            }
          />
          <Route
            path="/work-in-progress"
            element={
              <InventoryLayout>
                <WorkInProgress />
              </InventoryLayout>
            }
          />
          <Route
            path="/work-in-progress/new"
            element={
              <InventoryLayout>
                <WipForm />
              </InventoryLayout>
            }
          />
          <Route
            path="/order-history"
            element={
              <InventoryLayout>
                <OrderHistory />
              </InventoryLayout>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
