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
  Settings,
  Calendar,
  Package,
  ArrowRight,
  Beaker,
} from "lucide-react";
import type { WorkInProgress } from "@shared/api";

// Mock data - in a real app, this would come from API
const mockWipItems: WorkInProgress[] = [
  {
    id: "1",
    batchNumber: "BATCH-2024-001",
    orderId: "1",
    orderNumber: "ORD-2024-001",
    rawMaterialsUsed: [
      {
        id: "1",
        name: "Steel Sheet",
        quantity: 50,
        unit: "kg",
        costPerUnit: 2.5,
      },
      {
        id: "2",
        name: "Stainless Steel Bolts",
        quantity: 200,
        unit: "pieces",
        costPerUnit: 0.15,
      },
    ],
    expectedOutput: [
      {
        id: "1",
        name: "Steel Brackets",
        description: "Heavy duty steel brackets",
        quantity: 100,
        unit: "pieces",
        pricePerUnit: 15,
      },
    ],
    actualOutput: [
      {
        id: "1",
        name: "Steel Brackets",
        description: "Heavy duty steel brackets",
        quantity: 95,
        unit: "pieces",
        pricePerUnit: 15,
      },
    ],
    startDate: "2024-01-16T08:00:00Z",
    expectedEndDate: "2024-01-20T17:00:00Z",
    actualEndDate: "2024-01-20T16:30:00Z",
    status: "completed",
    notes: "Minor defects in 5 pieces, within acceptable tolerance",
  },
  {
    id: "2",
    batchNumber: "BATCH-2024-002",
    orderId: "2",
    orderNumber: "ORD-2024-002",
    rawMaterialsUsed: [
      {
        id: "3",
        name: "Aluminum Rod",
        quantity: 25,
        unit: "pieces",
        costPerUnit: 12,
      },
      {
        id: "4",
        name: "Cutting Fluid",
        quantity: 2,
        unit: "liters",
        costPerUnit: 15,
      },
    ],
    expectedOutput: [
      {
        id: "3",
        name: "Custom Fixtures",
        description: "Machined aluminum fixtures",
        quantity: 50,
        unit: "pieces",
        pricePerUnit: 120,
      },
    ],
    startDate: "2024-01-17T09:00:00Z",
    expectedEndDate: "2024-01-25T17:00:00Z",
    status: "in_progress",
    notes: "Complex machining process, monitoring quality closely",
  },
  {
    id: "3",
    batchNumber: "BATCH-2024-003",
    orderId: "3",
    orderNumber: "ORD-2024-003",
    rawMaterialsUsed: [
      {
        id: "5",
        name: "Aluminum Sheet",
        quantity: 15,
        unit: "sheets",
        costPerUnit: 45,
      },
    ],
    expectedOutput: [
      {
        id: "4",
        name: "Electronic Enclosures",
        description: "Weatherproof aluminum enclosures",
        quantity: 25,
        unit: "pieces",
        pricePerUnit: 85,
      },
    ],
    startDate: "2024-01-22T08:00:00Z",
    expectedEndDate: "2024-01-26T17:00:00Z",
    status: "planned",
    notes: "Waiting for quality control approval on raw materials",
  },
];

export default function WorkInProgress() {
  const [wipItems, setWipItems] = useState(mockWipItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWip, setSelectedWip] = useState<WorkInProgress | null>(null);

  const filteredWipItems = wipItems.filter((item) => {
    const matchesSearch =
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "outline";
      case "in_progress":
        return "default";
      case "completed":
        return "secondary";
      case "on_hold":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const moveToNextStep = (wipId: string) => {
    setWipItems((prev) =>
      prev.map((item) => {
        if (item.id === wipId) {
          if (item.status === "planned") {
            return { ...item, status: "in_progress" };
          } else if (item.status === "in_progress") {
            return {
              ...item,
              status: "completed",
              actualEndDate: new Date().toISOString(),
            };
          }
        }
        return item;
      }),
    );
    setSelectedWip(null);
  };

  const calculateTotalMaterialCost = (materials: any[]) => {
    return materials.reduce((total, material) => {
      return total + material.quantity * material.costPerUnit;
    }, 0);
  };

  const calculateExpectedValue = (products: any[]) => {
    return products.reduce((total, product) => {
      return total + product.quantity * product.pricePerUnit;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Work in Progress</h1>
        <Link to="/work-in-progress/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add to WIP
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
                placeholder="Search batches..."
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
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* WIP Items List */}
      <div className="grid gap-4">
        {filteredWipItems.map((wipItem) => (
          <Card
            key={wipItem.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedWip(wipItem)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Beaker className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {wipItem.batchNumber}
                    </h3>
                    <p className="text-gray-600">
                      Order: {wipItem.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(wipItem.status)}>
                    {wipItem.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Started: {formatDate(wipItem.startDate)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Expected: {formatDate(wipItem.expectedEndDate)}
                </div>
                <div className="flex items-center text-sm font-medium">
                  <Settings className="h-4 w-4 mr-2" />
                  Materials: $
                  {calculateTotalMaterialCost(
                    wipItem.rawMaterialsUsed,
                  ).toLocaleString()}
                </div>
              </div>

              {wipItem.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  {wipItem.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWipItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No WIP items found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters, or add a new batch to WIP.
            </p>
            <Link to="/work-in-progress/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add to WIP
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* WIP Details Modal */}
      {selectedWip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {selectedWip.batchNumber}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    Order: {selectedWip.orderNumber}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedWip(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Start Date:</span>{" "}
                    {formatDateTime(selectedWip.startDate)}
                  </div>
                  <div>
                    <span className="text-gray-600">Expected End:</span>{" "}
                    {formatDateTime(selectedWip.expectedEndDate)}
                  </div>
                  {selectedWip.actualEndDate && (
                    <div>
                      <span className="text-gray-600">Actual End:</span>{" "}
                      {formatDateTime(selectedWip.actualEndDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Materials Used */}
              <div>
                <h4 className="font-semibold mb-3">Raw Materials Used</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Material</th>
                        <th className="text-left p-3 font-medium">Quantity</th>
                        <th className="text-left p-3 font-medium">Unit Cost</th>
                        <th className="text-left p-3 font-medium">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWip.rawMaterialsUsed.map((material) => (
                        <tr key={material.id} className="border-t">
                          <td className="p-3">{material.name}</td>
                          <td className="p-3">
                            {material.quantity} {material.unit}
                          </td>
                          <td className="p-3">
                            ${material.costPerUnit.toFixed(2)}
                          </td>
                          <td className="p-3 font-medium">
                            $
                            {(material.quantity * material.costPerUnit).toFixed(
                              2,
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-gray-50">
                        <td colSpan={3} className="p-3 font-medium">
                          Total Material Cost:
                        </td>
                        <td className="p-3 font-bold">
                          $
                          {calculateTotalMaterialCost(
                            selectedWip.rawMaterialsUsed,
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expected Output */}
              <div>
                <h4 className="font-semibold mb-3">Expected Output</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Product</th>
                        <th className="text-left p-3 font-medium">
                          Description
                        </th>
                        <th className="text-left p-3 font-medium">Quantity</th>
                        <th className="text-left p-3 font-medium">
                          Unit Price
                        </th>
                        <th className="text-left p-3 font-medium">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWip.expectedOutput.map((product) => (
                        <tr key={product.id} className="border-t">
                          <td className="p-3 font-medium">{product.name}</td>
                          <td className="p-3">{product.description}</td>
                          <td className="p-3">
                            {product.quantity} {product.unit}
                          </td>
                          <td className="p-3">
                            ${product.pricePerUnit.toFixed(2)}
                          </td>
                          <td className="p-3 font-medium">
                            $
                            {(product.quantity * product.pricePerUnit).toFixed(
                              2,
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-gray-50">
                        <td colSpan={4} className="p-3 font-medium">
                          Total Expected Value:
                        </td>
                        <td className="p-3 font-bold">
                          $
                          {calculateExpectedValue(
                            selectedWip.expectedOutput,
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actual Output (if completed) */}
              {selectedWip.actualOutput && (
                <div>
                  <h4 className="font-semibold mb-3">Actual Output</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Product</th>
                          <th className="text-left p-3 font-medium">
                            Expected
                          </th>
                          <th className="text-left p-3 font-medium">Actual</th>
                          <th className="text-left p-3 font-medium">
                            Efficiency
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWip.actualOutput.map((product, index) => {
                          const expected = selectedWip.expectedOutput[index];
                          const efficiency =
                            (product.quantity / expected.quantity) * 100;
                          return (
                            <tr key={product.id} className="border-t">
                              <td className="p-3 font-medium">
                                {product.name}
                              </td>
                              <td className="p-3">
                                {expected.quantity} {expected.unit}
                              </td>
                              <td className="p-3">
                                {product.quantity} {product.unit}
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    efficiency >= 95 ? "default" : "secondary"
                                  }
                                >
                                  {efficiency.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedWip.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded">
                    {selectedWip.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedWip.status === "planned" && (
                  <Button
                    className="flex-1"
                    onClick={() => moveToNextStep(selectedWip.id)}
                  >
                    Start Production
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {selectedWip.status === "in_progress" && (
                  <Button
                    className="flex-1"
                    onClick={() => moveToNextStep(selectedWip.id)}
                  >
                    Mark as Completed
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedWip(null)}
                >
                  Edit Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
