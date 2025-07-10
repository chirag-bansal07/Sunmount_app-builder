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
import { Plus, Trash2 } from "lucide-react";
import { ProductLookup } from "@/components/ProductLookup";
import { dashboardEvents } from "@/lib/dashboard-events";

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  isRawMaterial: boolean;
}

interface Material {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  availableQuantity: number;
  quantity: number;
}

interface OutputProduct {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  expectedQuantity: number;
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
  const [outputProducts, setOutputProducts] = useState<OutputProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Generate batch number
      const now = new Date();
      const batchNum = `WIP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
      setBatchNumber(batchNum);
    }
  }, [open]);

  const addMaterial = (product: Product) => {
    const existingMaterial = materials.find((m) => m.productId === product.id);
    if (existingMaterial) {
      return; // Product already added
    }

    const newMaterial: Material = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      unit: product.unit,
      availableQuantity: product.quantity,
      quantity: 0,
    };

    setMaterials([...materials, newMaterial]);
  };

  const updateMaterialQuantity = (productId: string, quantity: number) => {
    setMaterials(
      materials.map((m) =>
        m.productId === productId ? { ...m, quantity } : m,
      ),
    );
  };

  const removeMaterial = (productId: string) => {
    setMaterials(materials.filter((m) => m.productId !== productId));
  };

  const addOutputProduct = (product: Product) => {
    const existingOutput = outputProducts.find(
      (o) => o.productId === product.id,
    );
    if (existingOutput) {
      return; // Product already added
    }

    const newOutput: OutputProduct = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      unit: product.unit,
      expectedQuantity: 0,
    };

    setOutputProducts([...outputProducts, newOutput]);
  };

  const updateOutputQuantity = (productId: string, quantity: number) => {
    setOutputProducts(
      outputProducts.map((o) =>
        o.productId === productId ? { ...o, expectedQuantity: quantity } : o,
      ),
    );
  };

  const removeOutputProduct = (productId: string) => {
    setOutputProducts(outputProducts.filter((o) => o.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/wip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch_number: batchNumber,
          raw_materials: materials.map((m) => ({
            product_code: m.productCode,
            quantity: m.quantity,
          })),
          output: outputProducts.map((o) => ({
            product_code: o.productCode,
            quantity: 0, // Initial quantity is 0, will be set during completion
            expected_quantity: o.expectedQuantity,
          })),
          product_code: materials[0]?.productCode || "WIP", // Use first material's code or default
          status: "in_progress",
          start_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onSuccess();
        onOpenChange(false);
        setBatchNumber("");
        setNotes("");
        setMaterials([]);
        setOutputProducts([]);
        // Trigger dashboard refresh
        dashboardEvents.refreshDashboard();
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
    materials.every((m) => m.quantity > 0) &&
    outputProducts.length > 0 &&
    outputProducts.every((o) => o.expectedQuantity > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductLookup
                onProductSelect={addMaterial}
                placeholder="Add raw material by product code..."
              />

              {materials.length > 0 && (
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.productId}
                      className="flex items-center space-x-2 p-3 border rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {material.productName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Code: {material.productCode} | Available:{" "}
                          {material.availableQuantity} {material.unit}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max={material.availableQuantity}
                          step="0.01"
                          value={material.quantity}
                          onChange={(e) =>
                            updateMaterialQuantity(
                              material.productId,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24"
                          placeholder="Qty"
                        />
                        <span className="text-sm text-muted-foreground">
                          {material.unit}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMaterial(material.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Expected Output Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductLookup
                onProductSelect={addOutputProduct}
                placeholder="Add expected output product..."
              />

              {outputProducts.length > 0 && (
                <div className="space-y-2">
                  {outputProducts.map((output) => (
                    <div
                      key={output.productId}
                      className="flex items-center space-x-2 p-3 border rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{output.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {output.productCode}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={output.expectedQuantity}
                          onChange={(e) =>
                            updateOutputQuantity(
                              output.productId,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24"
                          placeholder="Expected Qty"
                        />
                        <span className="text-sm text-muted-foreground">
                          {output.unit}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOutputProduct(output.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setBatchNumber("");
                setNotes("");
                setMaterials([]);
                setOutputProducts([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
