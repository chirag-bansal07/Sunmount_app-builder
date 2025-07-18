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
  Package,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
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
  status: "current" | "dispatched" | "completed";
  type: "sales" | "purchase";
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  notes?: string;
}

export default function OrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orderHistory`);
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
          status:
            order.status === "dispatched"
              ? "dispatched"
              : order.status === "completed"
                ? "completed"
                : "current",
          type: order.type,
          createdAt: order.date,
          updatedAt: order.date,
          dispatchedAt: order.status === "dispatched" ? order.date : undefined,
          notes: order.notes,
        }));
        setOrders(transformedData);
      } else {
        console.error("Failed to fetch order history");
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL parameters for filtering
  useEffect(() => {
    const customer = searchParams.get("customer");
    const supplier = searchParams.get("supplier");

    if (customer) {
      setCustomerFilter(customer);
    }
    if (supplier) {
      setSupplierFilter(supplier);
    }
  }, [searchParams]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    // Customer/Supplier filtering
    const matchesCustomerFilter = customerFilter
      ? order.customerName.toLowerCase().includes(customerFilter.toLowerCase())
      : true;

    const matchesSupplierFilter = supplierFilter
      ? order.customerName.toLowerCase().includes(supplierFilter.toLowerCase())
      : true;

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

    // Type filtering
    const matchesType = typeFilter === "all" || order.type === typeFilter;

    return (
      matchesSearch &&
      matchesDate &&
      matchesCustomerFilter &&
      matchesSupplierFilter &&
      matchesType
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dispatched":
        return "default";
      case "completed":
        return "secondary";
      case "current":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sales":
        return "bg-blue-100 text-blue-800";
      case "purchase":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading order history...</div>
      </div>
    );
  }

  const clearCustomerSupplierFilter = () => {
    setCustomerFilter("");
    setSupplierFilter("");
    setSearchParams({});
  };

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const dispatchedOrders = filteredOrders.filter(
    (order) => order.status === "dispatched",
  ).length;
  const currentOrders = filteredOrders.filter(
    (order) => order.status === "current",
  ).length;
  const totalRevenue = filteredOrders
    .filter((order) => order.status === "dispatched")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          {(customerFilter || supplierFilter) && (
            <div className="flex items-center mt-2 gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                Filtered by: {customerFilter || supplierFilter}
                <button
                  onClick={clearCustomerSupplierFilter}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
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
                <p className="text-sm text-gray-600">Dispatched</p>
                <p className="text-2xl font-bold text-green-600">
                  {dispatchedOrders}
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
                <p className="text-sm text-gray-600">Current</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentOrders}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales">Sales Orders</SelectItem>
                <SelectItem value="purchase">Purchase Orders</SelectItem>
              </SelectContent>
            </Select>

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
                      order.status === "dispatched"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {order.status === "dispatched" ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Package className="h-6 w-6 text-blue-600" />
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
                  <Badge className={getTypeColor(order.type)}>
                    {order.type}
                  </Badge>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
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
                    <span className="text-gray-600">Dispatched:</span>{" "}
                    {selectedOrder.dispatchedAt
                      ? formatDateTime(selectedOrder.dispatchedAt)
                      : "Not dispatched"}
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
