import { useState, useEffect } from "react";
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

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface RawMaterial {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

interface ExpectedProduct {
  id: string;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export default function WipForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    batchNumber: `WIP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}${new Date().getDate().toString().padStart(2, "0")}-${new Date().getHours().toString().padStart(2, "0")}${new Date().getMinutes().toString().padStart(2, "0")}`,
    startDate: new Date().toISOString().split("T")[0],
    expectedEndDate: "",
    notes: "",
  });

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [expectedOutput, setExpectedOutput] = useState<ExpectedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend interface
        const transformedData = data.map((product: any) => ({
          id: product.product_code,
          code: product.product_code,
          name: product.name,
          description: product.description || "",
          quantity: product.quantity,
          unitPrice: product.price,
          unit: "units",
        }));
        setAvailableProducts(transformedData);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  const allInventory = availableProducts;

  // Handle form field changes
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Raw Materials Functions
  const addRawMaterial = () => {
    setRawMaterials((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        productId: "",
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

  const selectRawMaterial = (index: number, productId: string) => {
    const product = availableProducts.find((p) => p.id === productId);
    if (product) {
      updateRawMaterial(index, "productId", productId);
      updateRawMaterial(index, "name", product.name);
      updateRawMaterial(index, "unit", product.unit);
      updateRawMaterial(index, "costPerUnit", product.unitPrice);
    }
  };

  // Expected Output Functions
  const addExpectedOutput = () => {
    setExpectedOutput((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        productId: "",
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
    field: keyof ExpectedProduct,
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
    const product = availableProducts.find((p) => p.id === productId);
    if (product) {
      updateExpectedOutput(index, "productId", productId);
      updateExpectedOutput(index, "name", product.name);
      updateExpectedOutput(index, "description", product.description);
      updateExpectedOutput(index, "unit", product.unit);
      updateExpectedOutput(index, "pricePerUnit", product.unitPrice);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batchNumber || rawMaterials.length === 0) {
      alert("Please fill in batch number and add at least one raw material");
      return;
    }

    try {
      const wipData = {
        batch_number: formData.batchNumber,
        raw_materials: rawMaterials
          .filter((m) => m.productId && m.quantity > 0)
          .map((m) => ({
            product_code:
              availableProducts.find((p) => p.id === m.productId)?.code ||
              m.productId,
            quantity: m.quantity,
          })),
        output: expectedOutput
          .filter((p) => p.productId && p.quantity > 0)
          .map((p) => ({
            product_code:
              availableProducts.find((prod) => prod.id === p.productId)?.code ||
              p.productId,
            quantity: p.quantity,
          })),
        status: "in_progress",
        start_date: new Date(formData.startDate).toISOString(),
      };

      console.log("Sending WIP data:", wipData);
      console.log("Raw materials count:", wipData.raw_materials.length);
      console.log("Expected output count:", wipData.output.length);
      console.log("Available products:", availableProducts.length);

      const response = await fetch("/api/wip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wipData),
      });

      console.log("Response status:", response.status, response.statusText);

      if (response.ok) {
        console.log("WIP batch created successfully");
        navigate("/work-in-progress");
      } else {
        // Show error based on status code without trying to read response body
        let errorMessage = "Unknown error occurred";

        switch (response.status) {
          case 400:
            errorMessage = "Invalid request data. Please check your inputs.";
            break;
          case 404:
            errorMessage = "WIP endpoint not found.";
            break;
          case 409:
            errorMessage =
              "Batch number already exists. Please use a different batch number.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Request failed with status ${response.status}`;
        }

        console.error("Failed to create WIP batch. Status:", response.status);
        alert(`Failed to create WIP batch: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error creating WIP batch:", error);
      alert("Failed to create WIP batch");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/work-in-progress")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to WIP
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create WIP Batch</h1>
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
                            value={material.productId}
                            onValueChange={(value) => {
                              selectRawMaterial(index, value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {allInventory.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.code})
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
                            value={product.productId}
                            onValueChange={(value) => {
                              selectProduct(index, value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {allInventory.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.code})
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
