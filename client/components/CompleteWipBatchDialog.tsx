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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { dashboardEvents } from "@/lib/dashboard-events";
import {
  Package,
  Factory,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";

interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  description?: string;
  unitPrice?: number;
}

interface WipMaterial {
  id: string;
  quantity: number;
  product: Product;
}

interface WipBatch {
  id: string;
  batchNumber: string;
  materials: WipMaterial[];
  outputs: any[];
  status: string;
  notes?: string | null;
  startDate: string;
}

interface OutputProduct {
  product_code: string;
  quantity: number;
  expected_quantity?: number;
  product_name?: string;
}

interface CompleteWipBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: WipBatch;
  onSuccess: () => void;
}

export function CompleteWipBatchDialog({
  open,
  onOpenChange,
  batch,
  onSuccess,
}: CompleteWipBatchDialogProps) {
  const [loading, setLoading] = useState(false);
  const [outputProducts, setOutputProducts] = useState<OutputProduct[]>([]);
  const [completionNotes, setCompletionNotes] = useState("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch available products for dropdown
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/inventory");
        if (response.ok) {
          const products = await response.json();
          setAvailableProducts(
            products.map((p: any) => ({
              id: p.product_code,
              code: p.product_code,
              name: p.name,
              unit: "units",
              description: p.description,
              unitPrice: p.price,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    if (open) {
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    if (open && batch) {
      const predefinedOutputs = batch.outputs || [];
      setOutputProducts(
        predefinedOutputs.map((output) => {
          const product = availableProducts.find(
            (p) => p.code === output.product_code,
          );
          return {
            product_code: output.product_code,
            product_name: product?.name || output.product_code,
            quantity: output.quantity || 0,
            expected_quantity: output.expected_quantity || 0,
          };
        }),
      );
      setCompletionNotes("");
    }
  }, [open, batch, availableProducts]);

  const addOutputProduct = () => {
    setOutputProducts((prev) => [
      ...prev,
      {
        product_code: "",
        product_name: "",
        quantity: 0,
      },
    ]);
  };

  const removeOutputProduct = (index: number) => {
    setOutputProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOutputProduct = (
    index: number,
    field: keyof OutputProduct,
    value: any,
  ) => {
    setOutputProducts((prev) =>
      prev.map((product, i) => {
        if (i === index) {
          if (field === "product_code") {
            const selectedProduct = availableProducts.find(
              (p) => p.code === value,
            );
            return {
              ...product,
              product_code: value,
              product_name: selectedProduct?.name || value,
            };
          }
          return { ...product, [field]: value };
        }
        return product;
      }),
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const validOutputs = outputProducts
        .filter((p) => p.product_code?.trim() && p.quantity > 0)
        .map((p) => ({
          product_code: p.product_code,
          quantity: p.quantity,
        }));

      if (validOutputs.length === 0) {
        alert("Please add at least one output product with a valid quantity.");
        setLoading(false);
        return;
      }

      const updateResponse = await fetch(`/api/wip/${batch.batchNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          end_date: new Date().toISOString(),
          output: validOutputs,
          notes: completionNotes.trim() || undefined,
        }),
      });

      if (updateResponse.ok) {
        onSuccess();
        onOpenChange(false);
        dashboardEvents.refreshDashboard();
      } else {
        const error = await updateResponse.json();
        console.error("Failed to complete WIP batch:", error);
        alert(error.error || "Failed to complete WIP batch");
      }
    } catch (error) {
      console.error("Error completing WIP batch:", error);
      alert("Failed to complete WIP batch");
    } finally {
      setLoading(false);
    }
  };

  const isValid = outputProducts.some(
    (p) => p.product_code?.trim() && p.quantity > 0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Factory className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Complete WIP Batch</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Batch: {batch.batchNumber}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Batch Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Batch Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Batch Number</Label>
                  <p className="font-medium">{batch.batchNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">
                    {new Date(batch.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Materials Used
                  </Label>
                  <p className="font-medium">{batch.materials.length} items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Used */}
          <Card>
            <CardHeader>
              <CardTitle>Materials Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {batch.materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded">
                        <Minus className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-900">
                          {material.product.name}
                        </p>
                        <p className="text-sm text-red-600">
                          Code: {material.product.code}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">
                      -{material.quantity} {material.product.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Output Products */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Output Products</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOutputProduct}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {outputProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No output products added yet.</p>
                  <p className="text-sm">
                    Click "Add Product" to define what this batch will produce.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outputProducts.map((product, index) => (
                    <div
                      key={index}
                      className="p-4 border border-green-200 bg-green-50 rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5">
                          <Label htmlFor={`product-${index}`}>Product</Label>
                          <select
                            id={`product-${index}`}
                            value={product.product_code}
                            onChange={(e) =>
                              updateOutputProduct(
                                index,
                                "product_code",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 p-2 border rounded-md bg-white"
                          >
                            <option value="">Select a product...</option>
                            {availableProducts.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name} ({p.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-3">
                          <Label htmlFor={`quantity-${index}`}>
                            Quantity Produced
                          </Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="0"
                            step="1"
                            value={product.quantity || ""}
                            onChange={(e) =>
                              updateOutputProduct(
                                index,
                                "quantity",
                                Number(e.target.value) || 0,
                              )
                            }
                            placeholder="Enter quantity"
                            className="bg-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Status</Label>
                          <div className="flex items-center mt-1">
                            {product.product_code && product.quantity > 0 ? (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Incomplete
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOutputProduct(index)}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about the batch completion, quality observations, or issues encountered..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {isValid
                ? "✓ Ready to complete batch"
                : "⚠️ Please add at least one output product with quantity"}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !isValid}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  "Completing..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Batch
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
