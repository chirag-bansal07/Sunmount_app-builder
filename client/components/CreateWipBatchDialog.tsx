import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { ProductLookup } from "@/components/ProductLookup";

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Material {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  unit: string;
  price: number;
  availableQuantity: number;
  quantity: number;
}

interface ExpectedOutput {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CreateWipBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWipBatchDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWipBatchDialogProps) {
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [expectedOutputs, setExpectedOutputs] = useState<ExpectedOutput[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Generate batch number
      const now = new Date();
      const batchNum = `WIP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
      setBatchNumber(batchNum);

      // Initialize with one empty row for each section
      setMaterials([
        {
          id: Date.now().toString(),
          productId: "",
          productCode: "",
          productName: "",
          description: "",
          unit: "",
          price: 0,
          availableQuantity: 0,
          quantity: 0,
        },
      ]);
      setExpectedOutputs([
        {
          id: (Date.now() + 1).toString(),
          productCode: "",
          productName: "",
          description: "",
          unit: "",
          price: 0,
          quantity: 0,
        },
      ]);
    }
  }, [open]);

  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      productId: "",
      productCode: "",
      productName: "",
      description: "",
      unit: "",
      price: 0,
      availableQuantity: 0,
      quantity: 0,
    };
    setMaterials([...materials, newMaterial]);
  };

  const addExpectedOutput = () => {
    const newOutput: ExpectedOutput = {
      id: Date.now().toString(),
      productCode: "",
      productName: "",
      description: "",
      unit: "",
      price: 0,
      quantity: 0,
    };
    setExpectedOutputs([...expectedOutputs, newOutput]);
  };

  const updateMaterial = (
    id: string,
    field: keyof Material,
    value: string | number,
  ) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const fetchMaterialDetails = async (
    productCode: string,
    materialId: string,
  ) => {
    if (!productCode.trim()) return;

    try {
      console.log("Fetching material details for:", productCode);
      const response = await fetch(`/api/inventory`);

      if (response.ok) {
        const products = await response.json();
        console.log("Inventory response:", products);

        const foundProduct = products.find(
          (p: any) =>
            p.code.toLowerCase() === productCode.toLowerCase() ||
            p.name.toLowerCase() === productCode.toLowerCase(),
        );

        if (foundProduct) {
          console.log("Found product:", foundProduct);
          setMaterials((prevMaterials) =>
            prevMaterials.map((material) =>
              material.id === materialId
                ? {
                    ...material,
                    productId: foundProduct.code,
                    productCode: foundProduct.code,
                    productName: foundProduct.name,
                    description: foundProduct.description || "",
                    unit: foundProduct.weight?.toString() || "units",
                    price: foundProduct.price || 0,
                    availableQuantity: foundProduct.quantity || 0,
                  }
                : material,
            ),
          );
        } else {
          console.log("Product not found for code:", productCode);
        }
      } else {
        console.error(
          "Failed to fetch inventory:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error fetching material details:", error);
    }
  };

  const updateExpectedOutput = (
    id: string,
    field: keyof ExpectedOutput,
    value: string | number,
  ) => {
    setExpectedOutputs(
      expectedOutputs.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );
  };

  const fetchExpectedOutputDetails = async (
    productCode: string,
    outputId: string,
  ) => {
    if (!productCode.trim()) return;

    try {
      const response = await fetch(`/api/inventory`);
      if (response.ok) {
        const products = await response.json();
        const foundProduct = products.find(
          (p: any) =>
            p.code.toLowerCase() === productCode.toLowerCase() ||
            p.name.toLowerCase() === productCode.toLowerCase(),
        );

        if (foundProduct) {
          setExpectedOutputs((prevOutputs) =>
            prevOutputs.map((output) =>
              output.id === outputId
                ? {
                    ...output,
                    productCode: foundProduct.code,
                    productName: foundProduct.name,
                    description: foundProduct.description || "",
                    unit: foundProduct.weight?.toString() || "units",
                    price: foundProduct.price || 0,
                  }
                : output,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching output details:", error);
    }
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const removeExpectedOutput = (id: string) => {
    setExpectedOutputs(expectedOutputs.filter((o) => o.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get all products to map product codes to IDs
      const productsResponse = await fetch(`/api/inventory`);
      if (!productsResponse.ok) {
        alert("Failed to fetch products for validation");
        setLoading(false);
        return;
      }
      const products = await productsResponse.json();

      // Filter and validate materials
      const validMaterials = materials.filter(
        (material) =>
          (material.productCode || material.productName) &&
          material.quantity > 0,
      );

      if (validMaterials.length === 0) {
        alert(
          "Please add at least one material with product code/name and quantity",
        );
        setLoading(false);
        return;
      }

      // Map materials to the correct format with productId
      const mappedMaterials = validMaterials.map((material) => {
        const foundProduct = products.find(
          (p: any) =>
            p.product_code === material.productCode ||
            p.name === material.productName,
        );

        if (!foundProduct) {
          throw new Error(
            `Product not found in inventory: ${material.productCode || material.productName}. Please check the product code/name.`,
          );
        }

        return {
          productId: foundProduct.product_code, // Using product_code as ID
          quantity: material.quantity,
        };
      });

      const response = await fetch("/api/wip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchNumber: batchNumber,
          notes: notes,
          materials: mappedMaterials,
        }),
      });

      if (response.ok) {
        onSuccess();
        onOpenChange(false);
        setBatchNumber("");
        setNotes("");
        setMaterials([]);
        setExpectedOutputs([]);
      } else {
        const error = await response.json();
        console.error("Failed to create WIP batch:", error);
        alert(error.error || "Failed to create WIP batch");
      }
    } catch (error) {
      console.error("Error creating WIP batch:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    batchNumber &&
    materials.length > 0 &&
    materials.some((m) => (m.productCode || m.productName) && m.quantity > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New WIP Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number*</Label>
              <Input
                id="batchNumber"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this batch..."
            />
          </div>

          {/* Raw Materials Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Raw Materials
            </h3>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Product Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Weight/Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materials.map((material, index) => (
                      <tr
                        key={material.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={material.productCode}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "productCode",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              fetchMaterialDetails(e.target.value, material.id)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter code"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={material.productName}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "productName",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              fetchMaterialDetails(e.target.value, material.id)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={material.description}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter description"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={material.unit}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "unit",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter unit"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            type="number"
                            value={material.quantity}
                            onChange={(e) =>
                              updateMaterial(
                                material.id,
                                "quantity",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter quantity"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterial(material.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                            disabled={materials.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Expected Output Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Expected Output
            </h3>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Product Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Weight/Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expectedOutputs.map((output, index) => (
                      <tr
                        key={output.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={output.productCode}
                            onChange={(e) =>
                              updateExpectedOutput(
                                output.id,
                                "productCode",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              fetchExpectedOutputDetails(
                                e.target.value,
                                output.id,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter code"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={output.productName}
                            onChange={(e) =>
                              updateExpectedOutput(
                                output.id,
                                "productName",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              fetchExpectedOutputDetails(
                                e.target.value,
                                output.id,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={output.description}
                            onChange={(e) =>
                              updateExpectedOutput(
                                output.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter description"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={output.unit}
                            onChange={(e) =>
                              updateExpectedOutput(
                                output.id,
                                "unit",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter unit"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            type="number"
                            value={output.quantity}
                            onChange={(e) =>
                              updateExpectedOutput(
                                output.id,
                                "quantity",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter quantity"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpectedOutput(output.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                            disabled={expectedOutputs.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <Button
              onClick={addMaterial}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add Raw Material
            </Button>

            <Button
              onClick={addExpectedOutput}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add Expected Output
            </Button>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setBatchNumber("");
                  setNotes("");
                  setMaterials([]);
                  setExpectedOutputs([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isValid}>
                {loading ? "Creating..." : "Create Batch"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
