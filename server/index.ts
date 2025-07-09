import express from "express";
import cors from "cors";
import path from "path";

// Import route handlers
import { handleDemo } from "./routes/demo";
import { getInventoryReportHandler } from "./routes/transactions-simple";
import {
  getWipBatchesHandler,
  createWipBatchHandler,
  completeWipBatchHandler,
} from "./routes/wip-simple";
import {
  getProductsHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  adjustInventoryHandler,
} from "./routes/products-simple";
import {
  getCustomersHandler,
  createCustomerHandler,
  getSuppliersHandler,
  createSupplierHandler,
} from "./routes/customers";
import {
  getQuotationsHandler,
  createQuotationHandler,
  updateQuotationHandler,
  moveToOrdersHandler,
  deleteQuotationHandler,
} from "./routes/quotations";
import {
  getCurrentOrdersHandler,
  getOrderHistoryHandler,
  dispatchOrderHandler,
} from "./routes/orders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/ping", handleDemo);
  app.get("/api/demo", handleDemo);

  // Inventory routes
  app.get("/api/inventory", getProductsHandler);
  app.get("/api/inventory-report", getInventoryReportHandler);
  app.post("/api/inventory", createProductHandler);
  app.put("/api/inventory/:productCode", updateProductHandler);
  app.delete("/api/inventory/:productCode", deleteProductHandler);
  app.post("/api/inventory/adjust", adjustInventoryHandler);

  // WIP routes
  app.get("/api/wip-batches", getWipBatchesHandler);
  app.get("/api/wip", getWipBatchesHandler);
  app.post("/api/wip", createWipBatchHandler);
  app.put("/api/wip/:id", completeWipBatchHandler);

  // Customer and Supplier routes
  app.get("/api/customers", getCustomersHandler);
  app.post("/api/customers", createCustomerHandler);
  app.get("/api/suppliers", getSuppliersHandler);
  app.post("/api/suppliers", createSupplierHandler);

  // Quotation routes
  app.get("/api/quotations", getQuotationsHandler);
  app.post("/api/quotations", createQuotationHandler);
  app.put("/api/quotations/:id", updateQuotationHandler);
  app.post("/api/quotations/:id/move-to-orders", moveToOrdersHandler);
  app.delete("/api/quotations/:id", deleteQuotationHandler);

  // Orders routes
  app.get("/api/currentOrders", getCurrentOrdersHandler);
  app.get("/api/orderHistory", getOrderHistoryHandler);
  app.post("/api/orders/:id/dispatch", dispatchOrderHandler);

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.join(__dirname, "../spa");
    app.use(express.static(staticPath));

    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  return app;
}

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
