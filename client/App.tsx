import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InventoryLayout from "./components/InventoryLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quotations from "./pages/Quotations";
import NewQuotation from "./pages/NewQuotation";
import CurrentOrders from "./pages/CurrentOrders";
import WorkInProgress from "./pages/WorkInProgress";
import WipForm from "./pages/WipForm";
import OrderHistory from "./pages/OrderHistory";
import CustomersSuppliers from "./pages/CustomersSuppliers";
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
          <Route path="/" element={<Login />} />
          <Route
            path="/new-order"
            element={
              <ProtectedRoute>
                <NewOrder />
              </ProtectedRoute>
            }
          />

          {/* Inventory Management Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <InventoryLayout>
                  <Dashboard />
                </InventoryLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute>
                <InventoryLayout>
                  <Quotations />
                </InventoryLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <ProtectedRoute>
                <InventoryLayout>
                  <NewQuotation />
                </InventoryLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/current-orders"
            element={
              <ProtectedRoute>
                <InventoryLayout>
                  <CurrentOrders />
                </InventoryLayout>
              </ProtectedRoute>
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
          <Route
            path="/customers-suppliers"
            element={
              <InventoryLayout>
                <CustomersSuppliers />
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
