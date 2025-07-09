import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  History,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import type { Order } from "@shared/api";

// Mock data - in a real app, this would come from API
const mockHistoryOrders: Order[] = [
  {
    id: "h1",
    orderNumber: "ORD-2023-045",
    quotationId: "q1",
    customerName: "Global Manufacturing Co.",
    customerEmail: "orders@globalmanuf.com",
    customerPhone: "+1234567890",
    items: [
      {
        id: "1",
        name: "Steel Brackets",
        description: "Heavy duty steel brackets",
        quantity: 200,
        unit: "pieces",
        pricePerUnit: 15,
      },
    ],
    totalAmount: 3000,
    status: "completed",
    createdAt: "2023-12-15T08:30:00Z",
    updatedAt: "2023-12-28T17:00:00Z",
    expectedDelivery: "2023-12-25T00:00:00Z",
    notes: "Delivered on time, customer satisfied",
  },
  {
    id: "h2",
    orderNumber: "ORD-2023-044",
    customerName: "TechStart Industries",
    customerEmail: "orders@techstart.com",
    customerPhone: "+1234567891",
    items: [
      {
        id: "2",
        name: "Custom Fixtures",
        description: "Machined aluminum fixtures",
        quantity: 75,
        unit: "pieces",
        pricePerUnit: 120,
      },
    ],
    totalAmount: 9000,
    status: "completed",
    createdAt: "2023-12-10T10:15:00Z",
    updatedAt: "2023-12-22T16:30:00Z",
    expectedDelivery: "2023-12-20T00:00:00Z",
    notes: "Complex specifications, delivered successfully",
  },
  {
    id: "h3",
    orderNumber: "ORD-2023-043",
    customerName: "BuildCo Ltd",
    customerEmail: "orders@buildco.com",
    customerPhone: "+1234567892",
    items: [
      {
        id: "3",
        name: "Electronic Enclosures",
        description: "Weatherproof aluminum enclosures",
        quantity: 30,
        unit: "pieces",
        pricePerUnit: 85,
      },
    ],
    totalAmount: 2550,
    status: "cancelled",
    createdAt: "2023-12-05T14:20:00Z",
    updatedAt: "2023-12-08T11:45:00Z",
    expectedDelivery: "2023-12-18T00:00:00Z",
    notes: "Cancelled due to customer budget constraints",
  },
  {
    id: "h4",
    orderNumber: "ORD-2023-042",
    customerName: "Metro Industries",
    customerEmail: "purchasing@metro.com",
    customerPhone: "+1234567893",
    items: [
      {
        id: "4",
        name: "Steel Fasteners",
        description: "High-grade steel bolts and nuts",
        quantity: 500,
        unit: "sets",
        pricePerUnit: 3.5,
      },
    ],
    totalAmount: 1750,
    status: "completed",
    createdAt: "2023-11-28T09:00:00Z",
    updatedAt: "2023-12-05T14:30:00Z",
    expectedDelivery: "2023-12-03T00:00:00Z",
    notes: "Repeat customer, fast turnaround",
  },
  {
    id: "h5",
    orderNumber: "ORD-2023-041",
    customerName: "Precision Works",
    customerEmail: "orders@precision.com",
    customerPhone: "+1234567894",
    items: [
      {
        id: "5",
        name: "Machined Components",
        description: "Precision-machined metal components",
        quantity: 25,
        unit: "pieces",
        pricePerUnit: 250,
      },
    ],
    totalAmount: 6250,
    status: "completed",
    createdAt: "2023-11-20T11:30:00Z",
    updatedAt: "2023-11-30T16:00:00Z",
    expectedDelivery: "2023-11-28T00:00:00Z",
    notes: "High precision requirements met successfully",
  },
];

export default function OrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState(mockHistoryOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      switch (dateFilter) {
        case "last_month":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchesDate = orderDate >= lastMonth;
          break;
        case "last_quarter":
          const lastQuarter = new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            1,
          );
          matchesDate = orderDate >= lastQuarter;
          break;
        case "last_year":
          const lastYear = new Date(now.getFullYear() - 1, 0, 1);
          matchesDate = orderDate >= lastYear;
          break;
      }
    }

    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(
    (order) => order.status === "completed",
  ).length;
  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "cancelled",
  ).length;
  const totalRevenue = filteredOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <History className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedOrders}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {cancelledOrders}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
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

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
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
                  <div
                    className={`p-2 rounded-lg ${
                      order.status === "completed"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {order.status === "completed" ? (
                      <CheckCircle
                        className={`h-6 w-6 ${
                          order.status === "completed"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
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
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Completed: {formatDate(order.updatedAt)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Expected: {formatDate(order.expectedDelivery)}
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
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find historical orders.
            </p>
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
              {/* Order Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Order Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>{" "}
                    {formatDateTime(selectedOrder.createdAt)}
                  </div>
                  <div>
                    <span className="text-gray-600">Expected Delivery:</span>{" "}
                    {formatDateTime(selectedOrder.expectedDelivery)}
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>{" "}
                    {formatDateTime(selectedOrder.updatedAt)}
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{" "}
                    <Badge variant={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

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

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
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

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Handle reorder functionality
                    console.log("Create new order based on:", selectedOrder);
                  }}
                >
                  Reorder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
