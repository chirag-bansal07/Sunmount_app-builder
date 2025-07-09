import { RequestHandler } from "express";
import { getOrders, saveOrders } from "../lib/ordersStore";
import {
  getProducts,
  saveProducts,
  getTransactions,
  saveTransactions,
  generateId,
} from "../lib/dataStore";

export const getCurrentOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const orders = await getOrders();
    const currentOrders = orders.filter((order) => order.status === "current");
    res.json(currentOrders);
  } catch (error) {
    console.error("Error fetching current orders:", error);
    res.status(500).json({ error: "Failed to fetch current orders" });
  }
};

export const getOrderHistoryHandler: RequestHandler = async (req, res) => {
  try {
    const orders = await getOrders();
    const dispatchedOrders = orders.filter(
      (order) => order.status === "dispatched",
    );
    res.json(dispatchedOrders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
};

export const dispatchOrderHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await getOrders();
    const products = await getProducts();
    const transactions = await getTransactions();

    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[orderIndex];
    if (order.status !== "current") {
      return res
        .status(400)
        .json({ error: "Only current orders can be dispatched" });
    }

    // Update inventory for each item (SALES - reduce inventory)
    for (const item of order.items) {
      let productIndex = products.findIndex(
        (p) => p.code === item.productCode || p.id === item.productId,
      );

      if (productIndex === -1) {
        // Product doesn't exist, create new entry with negative quantity
        const newProduct = {
          id: generateId(),
          code: item.productCode,
          name: item.productName,
          description: `Product from order ${order.orderNumber}`,
          quantity: -item.quantity, // Negative because it's a sale without stock
          unitPrice: item.unitPrice,
          unit: "units",
          category: "Products",
          isRawMaterial: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        products.push(newProduct);
        productIndex = products.length - 1;
      } else {
        // Product exists, reduce quantity
        products[productIndex].quantity -= item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }

      // Create sale transaction
      transactions.push({
        id: generateId(),
        type: "SALE",
        quantity: -item.quantity,
        unitPrice: item.unitPrice,
        productId: products[productIndex].id,
        reference: order.orderNumber,
        notes: `Sale to ${order.customerName}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Update order status to dispatched
    orders[orderIndex] = {
      ...order,
      status: "dispatched",
      dispatchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save all changes
    await Promise.all([
      saveOrders(orders),
      saveProducts(products),
      saveTransactions(transactions),
    ]);

    res.json(orders[orderIndex]);
  } catch (error) {
    console.error("Error dispatching order:", error);
    res.status(500).json({ error: "Failed to dispatch order" });
  }
};

export const deleteOrderHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await getOrders();

    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    orders.splice(orderIndex, 1);
    await saveOrders(orders);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};
