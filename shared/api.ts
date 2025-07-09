/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Inventory Management Types

export type OrderStatus =
  | "quotation"
  | "current"
  | "in_progress"
  | "completed"
  | "cancelled";
export type QuotationType = "sales" | "purchase";

export interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  type: QuotationType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Product[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Product[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  expectedDelivery: string;
  notes?: string;
  quantityReceived?: { [itemId: string]: number };
}

export interface WorkInProgress {
  id: string;
  batchNumber: string;
  orderId: string;
  orderNumber: string;
  rawMaterialsUsed: RawMaterial[];
  expectedOutput: Product[];
  actualOutput?: Product[];
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: "planned" | "in_progress" | "completed" | "on_hold";
  notes?: string;
}

export interface DashboardStats {
  totalQuotations: number;
  pendingQuotations: number;
  activeOrders: number;
  wipItems: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: "raw_material" | "finished_product";
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  costPerUnit: number;
  lastUpdated: string;
}
