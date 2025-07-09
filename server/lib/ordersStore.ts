import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const QUOTATIONS_FILE = path.join(DATA_DIR, "quotations.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: QuotationItem[];
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: QuotationItem[];
  totalAmount: number;
  status: "current" | "dispatched";
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  notes?: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  items: QuotationItem[];
  totalAmount: number;
  status: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function readJSONFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Quotations
export async function getQuotations(): Promise<Quotation[]> {
  return readJSONFile(QUOTATIONS_FILE, []);
}

export async function saveQuotations(quotations: Quotation[]): Promise<void> {
  await writeJSONFile(QUOTATIONS_FILE, quotations);
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return readJSONFile(ORDERS_FILE, []);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await writeJSONFile(ORDERS_FILE, orders);
}

// Purchases
export async function getPurchases(): Promise<Purchase[]> {
  return readJSONFile(PURCHASES_FILE, []);
}

export async function savePurchases(purchases: Purchase[]): Promise<void> {
  await writeJSONFile(PURCHASES_FILE, purchases);
}

export function generateOrderNumber(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const time = now.getTime().toString().slice(-4);
  return `${prefix}-${year}${month}${day}-${time}`;
}
