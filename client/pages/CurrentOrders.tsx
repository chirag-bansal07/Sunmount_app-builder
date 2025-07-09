import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  ShoppingCart,
  Calendar,
  DollarSign,
  ArrowRight,
  Package,
} from "lucide-react";
import type { Order } from "@shared/api";

// Mock data - in a real app, this would come from API
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    quotationId: "1",
    customerName: "Global Manufacturing Co.",
    customerEmail: "orders@globalmanuf.com",
    customerPhone: "+1234567890",
    items: [
      {
        id: "1",
        name: "Steel Brackets",
        description: "Heavy duty steel brackets",
        quantity: 100,
        unit: "pieces",
        pricePerUnit: 15,
      },
      {
        id: "2",
        name: "Mounting Hardware",
        description: "Stainless steel bolts and nuts",
        quantity: 200,
        unit: "sets",
        pricePerUnit: 3.5,
      },
    ],
    totalAmount: 2200,
    status: "packing",
    createdAt: "2024-01-16T08:30:00Z",
    updatedAt: "2024-01-16T08:30:00Z",
    expectedDelivery: "2024-01-30T00:00:00Z",
    notes: "Rush order - priority delivery",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerName: "Metro Industries",
    customerEmail: "purchasing@metro.com",
    customerPhone: "+1234567891",
    items: [
      {
        id: "3",
        name: "Custom Fixtures",
        description: "Machined aluminum fixtures",
        quantity: 50,
        unit: "pieces",
        pricePerUnit: 120,
      },
    ],
    totalAmount: 6000,
    status: "packing",
    createdAt: "2024-01-14T10:15:00Z",
    updatedAt: "2024-01-17T14:20:00Z",
    expectedDelivery: "2024-02-05T00:00:00Z",
    notes: "Custom specifications provided by customer",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerName: "TechStart Industries",
    customerEmail: "orders@techstart.com",
    customerPhone: "+1234567892",
    items: [
      {
        id: "4",
        name: "Electronic Enclosures",
        description: "Weatherproof aluminum enclosures",
        quantity: 25,
        unit: "pieces",
        pricePerUnit: 85,
      },
    ],
    totalAmount: 2125,
    status: "packing",
    createdAt: "2024-01-15T16:45:00Z",
    updatedAt: "2024-01-15T16:45:00Z",
    expectedDelivery: "2024-01-28T00:00:00Z",
    quantityReceived: { "4": 0 },
  },
];

export default function CurrentOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const isPacking = order.status === "packing";

    return matchesSearch && isPacking;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "packing":
        return "default";
      case "completed":
        return "outline";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const moveToNextStep = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          if (order.status === "packing") {
            return { ...order, status: "completed" };
          }
        }
        return order;
      }),
    );
    setSelectedOrder(null);
  };

  const updateQuantityReceived = (
    orderId: string,
    itemId: string,
    quantity: number,
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            quantityReceived: {
              ...order.quantityReceived,
              [itemId]: quantity,
            },
          };
        }
        return order;
      }),
    );
  };

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
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Delivery: {formatDate(order.expectedDelivery)}
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
                    <span className="text-gray-600">Expected Delivery:</span>{" "}
                    {formatDate(selectedOrder.expectedDelivery)}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{" "}
                    <Badge variant={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.replace("_", " ")}
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
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.pricePerUnit} per {item.unit}
                        </p>
                      </div>
                      {selectedOrder.quantityReceived && (
                        <div className="ml-4 w-24">
                          <label className="text-xs text-gray-600">
                            Received:
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={selectedOrder.quantityReceived[item.id] || 0}
                            onChange={(e) =>
                              updateQuantityReceived(
                                selectedOrder.id,
                                item.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
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
                    onClick={() => moveToNextStep(selectedOrder.id)}
                  >
                    Move to Production
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {selectedOrder.status === "in_progress" && (
                  <Button
                    className="flex-1"
                    onClick={() => moveToNextStep(selectedOrder.id)}
                  >
                    Mark as Completed
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {selectedOrder.quantityReceived && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Handle inventory update
                      console.log("Update inventory with received quantities");
                      setSelectedOrder(null);
                    }}
                  >
                    Update Inventory
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  Edit Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
