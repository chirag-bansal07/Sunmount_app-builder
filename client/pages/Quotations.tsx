import { useState, useEffect } from "react";
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
  Filter,
  FileText,
  Calendar,
  DollarSign,
  ArrowRight,
  Package,
} from "lucide-react";
const API_URL =
  import.meta.env.VITE_API_URL || "https://sunmount-app-builder.onrender.com";
interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  quantityReceived?: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: QuotationItem[];
  totalAmount: number;
  status: "pending" | "approved" | "rejected";
  type: "sales" | "purchase";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );
  const [quantityUpdates, setQuantityUpdates] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/quotations`);
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend interface
        const transformedData = data.map((quotation: any) => ({
          id: quotation.order_id,
          quotationNumber: quotation.order_id,
          customerName: quotation.customerName || quotation.party_id,
          customerEmail: quotation.customerEmail,
          customerPhone: quotation.customerPhone,
          items: Array.isArray(quotation.products)
            ? quotation.products.map((product: any, index: number) => ({
                id: index.toString(),
                productId: product.product_code,
                productName: product.product_name || product.name,
                productCode: product.product_code,
                quantity: product.quantity || product.quantity_ordered,
                unitPrice: product.price || product.unit_price,
                totalPrice:
                  (product.quantity || product.quantity_ordered) *
                  (product.price || product.unit_price),
                quantityReceived: product.quantity_received || 0,
              }))
            : [],
          totalAmount: Array.isArray(quotation.products)
            ? quotation.products.reduce(
                (sum: number, product: any) =>
                  sum +
                  (product.quantity || product.quantity_ordered) *
                    (product.price || product.unit_price),
                0,
              )
            : 0,
          status: "pending", // Default status
          type: quotation.type,
          createdAt: quotation.date,
          updatedAt: quotation.date,
          notes: quotation.notes,
        }));
        setQuotations(transformedData);
      } else {
        console.error("Failed to fetch quotations");
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.quotationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || quotation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const moveToOrders = async (quotationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/quotations/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: quotationId,
          status: "packing",
        }),
      });

      if (response.ok) {
        await fetchQuotations(); // Refresh the list
        setSelectedQuotation(null);
      } else {
        const error = await response.json();
        alert(`Failed to move to orders: ${error.error}`);
      }
    } catch (error) {
      console.error("Error moving quotation to orders:", error);
      alert("Failed to move quotation to orders");
    }
  };

  const updatePurchaseQuantities = async (quotationId: string) => {
    try {
      const updatedProducts = Object.entries(quantityUpdates).map(
        ([productCode, quantity]) => ({
          product_code: productCode,
          quantity_received: quantity,
        }),
      );

      const response = await fetch(`${API_URL}/api/quotations/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: quotationId,
          updated_products: updatedProducts,
        }),
      });

      if (response.ok) {
        await fetchQuotations(); // Refresh the list
        setSelectedQuotation(null);
        setQuantityUpdates({});
      } else {
        const error = await response.json();
        alert(`Failed to update purchase: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
      alert("Failed to update purchase");
    }
  };

  const completePurchase = async (quotationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/quotations/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: quotationId,
          status: "completed",
        }),
      });

      if (response.ok) {
        await fetchQuotations(); // Refresh the list
        setSelectedQuotation(null);
      } else {
        const error = await response.json();
        alert(`Failed to complete purchase: ${error.error}`);
      }
    } catch (error) {
      console.error("Error completing purchase:", error);
      alert("Failed to complete purchase");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quotations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
        <Link to="/quotations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
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
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => (
          <Card
            key={quotation.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedQuotation(quotation)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {quotation.quotationNumber}
                    </h3>
                    <p className="text-gray-600">{quotation.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(quotation.status)}>
                    {quotation.status}
                  </Badge>
                  {quotation.status === "pending" &&
                    quotation.type === "sales" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToOrders(quotation.id);
                        }}
                      >
                        Move to Packing
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  {quotation.type === "purchase" && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700"
                    >
                      Purchase Order
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {formatDate(quotation.createdAt)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Items: {quotation.items.length}
                </div>
                <div className="flex items-center text-sm font-medium">
                  <DollarSign className="h-4 w-4 mr-2" />$
                  {quotation.totalAmount.toLocaleString()}
                </div>
              </div>

              {quotation.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  {quotation.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quotations found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters, or create a new quotation.
            </p>
            <Link to="/quotations/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Quotation
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {selectedQuotation.quotationNumber}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {selectedQuotation.customerName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedQuotation(null)}
                >
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
                    {selectedQuotation.customerEmail}
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>{" "}
                    {selectedQuotation.customerPhone}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">
                  {selectedQuotation.type === "purchase"
                    ? "Purchase Items"
                    : "Items"}
                </h4>
                {selectedQuotation.type === "purchase" ? (
                  <div className="space-y-2">
                    {selectedQuotation.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              Code: {item.productCode}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              ${item.unitPrice.toFixed(2)} per unit
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Ordered:</span>{" "}
                            {item.quantity}
                          </div>
                          <div>
                            <span className="text-gray-600">Received:</span>{" "}
                            {item.quantityReceived || 0}
                          </div>
                          <div>
                            <span className="text-gray-600">Pending:</span>{" "}
                            {item.quantity - (item.quantityReceived || 0)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">
                            Receive Qty:
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity - (item.quantityReceived || 0)}
                            value={quantityUpdates[item.productCode] || 0}
                            onChange={(e) =>
                              setQuantityUpdates((prev) => ({
                                ...prev,
                                [item.productCode]:
                                  parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-20 h-8"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedQuotation.items.map((item) => (
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
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>${selectedQuotation.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedQuotation.type === "sales" &&
                  selectedQuotation.status === "pending" && (
                    <Button
                      className="flex-1"
                      onClick={() => moveToOrders(selectedQuotation.id)}
                    >
                      Move to Packing
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                {selectedQuotation.type === "purchase" &&
                  selectedQuotation.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        disabled={
                          Object.keys(quantityUpdates).length === 0 ||
                          Object.values(quantityUpdates).every(
                            (qty) => qty === 0,
                          )
                        }
                        onClick={() =>
                          updatePurchaseQuantities(selectedQuotation.id)
                        }
                      >
                        Submit Partial
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => completePurchase(selectedQuotation.id)}
                      >
                        Complete Purchase
                      </Button>
                    </>
                  )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedQuotation(null)}
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
