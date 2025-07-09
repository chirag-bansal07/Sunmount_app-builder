import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import type { RawMaterial, Product, WorkInProgress } from "@shared/api";

// Mock data for orders that can be added to WIP
const availableOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerName: "Global Manufacturing Co.",
  },
  { id: "2", orderNumber: "ORD-2024-002", customerName: "Metro Industries" },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerName: "TechStart Industries",
  },
];

// Mock data for available raw materials
const availableRawMaterials = [
  { id: "1", name: "Steel Sheet", unit: "kg", costPerUnit: 2.5 },
  { id: "2", name: "Aluminum Rod", unit: "pieces", costPerUnit: 12 },
  { id: "3", name: "Stainless Steel Bolts", unit: "pieces", costPerUnit: 0.15 },
  { id: "4", name: "Cutting Fluid", unit: "liters", costPerUnit: 15 },
  { id: "5", name: "Aluminum Sheet", unit: "sheets", costPerUnit: 45 },
];

// Mock data for product templates
const productTemplates = [
  {
    id: "1",
    name: "Steel Brackets",
    description: "Heavy duty steel brackets",
    unit: "pieces",
    pricePerUnit: 15,
  },
  {
    id: "2",
    name: "Custom Fixtures",
    description: "Machined aluminum fixtures",
    unit: "pieces",
    pricePerUnit: 120,
  },
  {
    id: "3",
    name: "Electronic Enclosures",
    description: "Weatherproof aluminum enclosures",
    unit: "pieces",
    pricePerUnit: 85,
  },
];

export default function WipForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    batchNumber: `BATCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    orderId: "",
    orderNumber: "",
    startDate: new Date().toISOString().split("T")[0],
    expectedEndDate: "",
    notes: "",
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [expectedOutput, setExpectedOutput] = useState<Product[]>([]);

  // Handle form field changes
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill order number when order is selected
    if (field === "orderId") {
      const selectedOrder = availableOrders.find((order) => order.id === value);
      if (selectedOrder) {
        setFormData((prev) => ({
          ...prev,
          orderNumber: selectedOrder.orderNumber,
        }));
      }
    }
  };

  // Raw Materials Functions
  const addRawMaterial = () => {
    setRawMaterials((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        quantity: 0,
        unit: "",
        costPerUnit: 0,
      },
    ]);
  };

  const updateRawMaterial = (
    index: number,
    field: keyof RawMaterial,
    value: string | number,
  ) => {
    setRawMaterials((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeRawMaterial = (index: number) => {
    setRawMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const selectRawMaterial = (index: number, materialId: string) => {
    const material = availableRawMaterials.find((m) => m.id === materialId);
    if (material) {
      updateRawMaterial(index, "name", material.name);
      updateRawMaterial(index, "unit", material.unit);
      updateRawMaterial(index, "costPerUnit", material.costPerUnit);
    }
  };

  // Expected Output Functions
  const addExpectedOutput = () => {
    setExpectedOutput((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        description: "",
        quantity: 0,
        unit: "",
        pricePerUnit: 0,
      },
    ]);
  };

  const updateExpectedOutput = (
    index: number,
    field: keyof Product,
    value: string | number,
  ) => {
    setExpectedOutput((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeExpectedOutput = (index: number) => {
    setExpectedOutput((prev) => prev.filter((_, i) => i !== index));
  };

  const selectProduct = (index: number, productId: string) => {
    const product = productTemplates.find((p) => p.id === productId);
    if (product) {
      updateExpectedOutput(index, "name", product.name);
      updateExpectedOutput(index, "description", product.description);
      updateExpectedOutput(index, "unit", product.unit);
      updateExpectedOutput(index, "pricePerUnit", product.pricePerUnit);
    }
  };

  // Calculate totals
  const totalMaterialCost = rawMaterials.reduce(
    (total, material) => total + material.quantity * material.costPerUnit,
    0,
  );

  const totalExpectedValue = expectedOutput.reduce(
    (total, product) => total + product.quantity * product.pricePerUnit,
    0,
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const wipData: Partial<WorkInProgress> = {
      batchNumber: formData.batchNumber,
      orderId: formData.orderId,
      orderNumber: formData.orderNumber,
      rawMaterialsUsed: rawMaterials,
      expectedOutput: expectedOutput,
      startDate: new Date(formData.startDate).toISOString(),
      expectedEndDate: new Date(formData.expectedEndDate).toISOString(),
      status: "planned",
      notes: formData.notes,
    };

    // In a real app, this would be an API call
    console.log("Creating WIP:", wipData);

    // Navigate back to WIP list
    navigate("/work-in-progress");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/work-in-progress")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to WIP
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Add to Work in Progress
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    handleFormChange("batchNumber", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="orderId">Related Order</Label>
                <Select
                  value={formData.orderId}
                  onValueChange={(value) => handleFormChange("orderId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleFormChange("startDate", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="expectedEndDate">Expected End Date</Label>
                <Input
                  id="expectedEndDate"
                  type="date"
                  value={formData.expectedEndDate}
                  onChange={(e) =>
                    handleFormChange("expectedEndDate", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                placeholder="Add any notes about this batch..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Raw Materials Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Raw Materials Used</CardTitle>
              <Button type="button" onClick={addRawMaterial} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rawMaterials.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Cost per Unit</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={material.name}
                            onValueChange={(value) => {
                              const selectedMaterial =
                                availableRawMaterials.find(
                                  (m) => m.name === value,
                                );
                              if (selectedMaterial) {
                                selectRawMaterial(index, selectedMaterial.id);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRawMaterials.map((mat) => (
                                <SelectItem key={mat.id} value={mat.name}>
                                  {mat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.quantity}
                            onChange={(e) =>
                              updateRawMaterial(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.costPerUnit}
                            onChange={(e) =>
                              updateRawMaterial(
                                index,
                                "costPerUnit",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          $
                          {(material.quantity * material.costPerUnit).toFixed(
                            2,
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRawMaterial(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={4} className="font-medium">
                        Total Material Cost:
                      </TableCell>
                      <TableCell className="font-bold">
                        ${totalMaterialCost.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No materials added yet. Click "Add Material" to start.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expected Output Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Expected Output</CardTitle>
              <Button
                type="button"
                onClick={addExpectedOutput}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {expectedOutput.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price per Unit</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expectedOutput.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={product.name}
                            onValueChange={(value) => {
                              const selectedProduct = productTemplates.find(
                                (p) => p.name === value,
                              );
                              if (selectedProduct) {
                                selectProduct(index, selectedProduct.id);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productTemplates.map((prod) => (
                                <SelectItem key={prod.id} value={prod.name}>
                                  {prod.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={product.description}
                            onChange={(e) =>
                              updateExpectedOutput(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Product description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={product.quantity}
                            onChange={(e) =>
                              updateExpectedOutput(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={product.unit}
                            onChange={(e) =>
                              updateExpectedOutput(
                                index,
                                "unit",
                                e.target.value,
                              )
                            }
                            placeholder="Unit"
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={product.pricePerUnit}
                            onChange={(e) =>
                              updateExpectedOutput(
                                index,
                                "pricePerUnit",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          $
                          {(product.quantity * product.pricePerUnit).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpectedOutput(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={5} className="font-medium">
                        Total Expected Value:
                      </TableCell>
                      <TableCell className="font-bold">
                        ${totalExpectedValue.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No products added yet. Click "Add Product" to start.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Material Cost</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalMaterialCost.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Expected Output Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalExpectedValue.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Expected Profit Margin</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalMaterialCost > 0
                    ? `${(((totalExpectedValue - totalMaterialCost) / totalExpectedValue) * 100).toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/work-in-progress")}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create WIP Batch
          </Button>
        </div>
      </form>
    </div>
  );
}
