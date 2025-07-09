import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");
const SUPPLIERS_FILE = path.join(DATA_DIR, "suppliers.json");

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
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

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return readJSONFile(CUSTOMERS_FILE, []);
}

export async function saveCustomers(customers: Customer[]): Promise<void> {
  await writeJSONFile(CUSTOMERS_FILE, customers);
}

// Suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  return readJSONFile(SUPPLIERS_FILE, []);
}

export async function saveSuppliers(suppliers: Supplier[]): Promise<void> {
  await writeJSONFile(SUPPLIERS_FILE, suppliers);
}
