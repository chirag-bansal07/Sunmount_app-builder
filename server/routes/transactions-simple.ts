import { RequestHandler } from "express";
import { getTransactions, getProducts } from "../lib/dataStore";

export const getTransactionsHandler: RequestHandler = async (req, res) => {
  try {
    const transactions = await getTransactions();
    const products = await getProducts();

    // Add product info to transactions
    const transactionsWithProduct = transactions.map((transaction) => ({
      ...transaction,
      product: products.find((p) => p.id === transaction.productId),
    }));

    res.json(transactionsWithProduct);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

export const getInventoryReportHandler: RequestHandler = async (req, res) => {
  try {
    const products = await getProducts();

    const report = products.map((product) => ({
      ...product,
      totalValue: product.quantity * product.unitPrice,
    }));

    const totalInventoryValue = report.reduce(
      (sum, product) => sum + product.totalValue,
      0,
    );

    res.json({
      products: report,
      summary: {
        totalProducts: products.length,
        totalInventoryValue,
      },
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({ error: "Failed to generate inventory report" });
  }
};
