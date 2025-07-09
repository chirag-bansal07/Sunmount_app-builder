import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ShoppingCart,
  Calendar,
  DollarSign,
  ArrowRight,
  Package,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "current" | "dispatched";
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  notes?: string;
}

export default function CurrentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchCurrentOrders();
  }, []);

  const fetchCurrentOrders = async () => {
    try {
      const response = await fetch("/api/currentOrders");
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend interface
        const transformedData = data.map((order: any) => ({
          id: order.order_id,
          orderNumber: order.order_id,
          quotationId: order.order_id,
          customerName: order.customerName || order.party_id,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          items: Array.isArray(order.products)
            ? order.products.map((product: any, index: number) => ({
                id: index.toString(),
                productId: product.product_code,
                productName: product.product_name || product.name,
                productCode: product.product_code,
                quantity: product.quantity || product.quantity_ordered,
                unitPrice: product.price || product.unit_price,
                totalPrice:
                  (product.quantity || product.quantity_ordered) *
                  (product.price || product.unit_price),
              }))
            : [],
          totalAmount: Array.isArray(order.products)
            ? order.products.reduce(
                (sum: number, product: any) =>
                  sum +
                  (product.quantity || product.quantity_ordered) *
                    (product.price || product.unit_price),
                0,
              )
            : 0,
          status: "current",
          createdAt: order.date,
          updatedAt: order.date,
          notes: order.notes,
        }));
        setOrders(transformedData);
      } else {
        console.error("Failed to fetch current orders");
      }
    } catch (error) {
      console.error("Error fetching current orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "default";
      case "dispatched":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const dispatchOrder = async (orderId: string) => {
    try {
      const response = await fetch("/api/quotations/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          status: "dispatched",
        }),
      });

      if (response.ok) {
        await fetchCurrentOrders(); // Refresh the list
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        alert(`Failed to dispatch order: ${error.error}`);
      }
    } catch (error) {
      console.error("Error dispatching order:", error);
      alert("Failed to dispatch order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading current orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Current Orders</h1>
        <Link to="/quotations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {order.orderNumber}
                    </h3>
                    <p className="text-gray-600">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  {order.status === "current" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatchOrder(order.id);
                      }}
                    >
                      Dispatch
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Items: {order.items.length}
                </div>
                <div className="flex items-center text-sm font-medium">
                  <DollarSign className="h-4 w-4 mr-2" />$
                  {order.totalAmount.toLocaleString()}
                </div>
              </div>

              {order.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  {order.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters, or create a new order.
            </p>
            <Link to="/quotations/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Order
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {selectedOrder.orderNumber}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Details */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>{" "}
                    {selectedOrder.customerEmail}
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>{" "}
                    {selectedOrder.customerPhone}
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h4 className="font-semibold mb-2">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{" "}
                    <Badge variant={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          Code: {item.productCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.quantity} units</p>
                        <p className="text-sm text-gray-600">
                          ${item.unitPrice.toFixed(2)} per unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>${selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedOrder.status === "current" && (
                  <Button
                    className="flex-1"
                    onClick={() => dispatchOrder(selectedOrder.id)}
                  >
                    Dispatch Order
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
