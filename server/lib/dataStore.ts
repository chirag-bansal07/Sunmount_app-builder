import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const WIP_BATCHES_FILE = path.join(DATA_DIR, "wip-batches.json");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  category?: string;
  isRawMaterial: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  productId: string;
}

interface WipBatch {
  id: string;
  batchNumber: string;
  status: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  materials: Array<{
    id: string;
    quantity: number;
    product: Product;
  }>;
  outputs: Array<{
    id: string;
    quantity: number;
    product: Product;
  }>;
}

// Ensure data directory exists
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

export async function getProducts(): Promise<Product[]> {
  return readJSONFile(PRODUCTS_FILE, []);
}

export async function saveProducts(products: Product[]): Promise<void> {
  await writeJSONFile(PRODUCTS_FILE, products);
}

export async function getTransactions(): Promise<Transaction[]> {
  return readJSONFile(TRANSACTIONS_FILE, []);
}

export async function saveTransactions(
  transactions: Transaction[],
): Promise<void> {
  await writeJSONFile(TRANSACTIONS_FILE, transactions);
}

export async function getWipBatches(): Promise<WipBatch[]> {
  return readJSONFile(WIP_BATCHES_FILE, []);
}

export async function saveWipBatches(batches: WipBatch[]): Promise<void> {
  await writeJSONFile(WIP_BATCHES_FILE, batches);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
