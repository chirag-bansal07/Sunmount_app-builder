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
  Filter,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { Quotation } from "@shared/api";

// Mock data - in a real app, this would come from API
const mockQuotations: Quotation[] = [
  {
    id: "1",
    quotationNumber: "QT-2024-001",
    type: "sales",
    customerName: "Acme Corporation",
    customerEmail: "john@acme.com",
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
    ],
    totalAmount: 1500,
    status: "quotation",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    validUntil: "2024-02-15T10:30:00Z",
    notes: "Bulk order discount applied",
  },
  {
    id: "2",
    quotationNumber: "QT-2024-002",
    type: "purchase",
    customerName: "TechStart Industries",
    customerEmail: "sarah@techstart.com",
    customerPhone: "+1234567891",
    items: [
      {
        id: "2",
        name: "Raw Aluminum",
        description: "6061-T6 Aluminum sheets",
        quantity: 50,
        unit: "sheets",
        pricePerUnit: 85,
      },
    ],
    totalAmount: 4250,
    status: "quotation",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
    validUntil: "2024-02-14T14:20:00Z",
  },
  {
    id: "3",
    quotationNumber: "QT-2024-003",
    type: "sales",
    customerName: "BuildCo Ltd",
    customerEmail: "mike@buildco.com",
    customerPhone: "+1234567892",
    items: [
      {
        id: "3",
        name: "Custom Fixtures",
        description: "Machined aluminum fixtures",
        quantity: 25,
        unit: "pieces",
        pricePerUnit: 120,
      },
    ],
    totalAmount: 3000,
    status: "packing",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-16T11:45:00Z",
    validUntil: "2024-02-13T09:15:00Z",
  },
];

export default function Quotations() {
  const [quotations, setQuotations] = useState(mockQuotations);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.quotationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || quotation.type === typeFilter;
    const isQuotation = quotation.status === "quotation";

    return matchesSearch && matchesType && isQuotation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "quotation":
        return "default";
      case "current":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sales":
        return "bg-green-100 text-green-800";
      case "purchase":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
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
                  <Badge className={getTypeColor(quotation.type)}>
                    {quotation.type}
                  </Badge>
                  <Badge variant={getStatusColor(quotation.status)}>
                    {quotation.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {formatDate(quotation.createdAt)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Valid Until: {formatDate(quotation.validUntil)}
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
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedQuotation.items.map((item) => (
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
                  <span>${selectedQuotation.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedQuotation.status === "quotation" && (
                  <>
                    <Button className="flex-1">Convert to Order</Button>
                    <Button variant="outline" className="flex-1">
                      Edit Quotation
                    </Button>
                  </>
                )}
                {selectedQuotation.type === "purchase" &&
                  selectedQuotation.status === "packing" && (
                    <Button className="flex-1">Mark as Received</Button>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
