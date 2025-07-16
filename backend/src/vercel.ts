import { VercelRequest, VercelResponse } from "@vercel/node";
import express, { Request, Response } from "express";
import cors from "cors";
import inventoryRoutes from "./routes/inventory";
import quotationsRoutes from "./routes/quotations";
import currentOrdersRoutes from "./routes/currentOrders";
import orderHistoryRoutes from "./routes/orderHistory";
import wipRoutes from "./routes/wip";
import customerRoutes from "./routes/customers";
import supplierRoutes from "./routes/suppliers";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => res.send("Server is running"));

// API endpoints
app.use("/api/inventory", inventoryRoutes);
app.use("/api/quotations", quotationsRoutes);
app.use("/api/currentOrders", currentOrdersRoutes);
app.use("/api/orderHistory", orderHistoryRoutes);
app.use("/api/wip", wipRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);

export default app;
