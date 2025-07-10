import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardEvents } from "@/lib/dashboard-events";

interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
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
}

interface OutputProduct {
  product_code: string;
  quantity: number;
  expected_quantity?: number;
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

  useEffect(() => {
    if (open && batch) {
      // Load predefined output products from the batch
      const predefinedOutputs = batch.outputs || [];
      setOutputProducts(
        predefinedOutputs.map((output: any) => ({
          product_code: output.product_code,
          quantity: output.quantity || 0,
          expected_quantity: output.expected_quantity || 0,
        })),
      );
    }
  }, [open, batch]);

  const updateOutputQuantity = (product_code: string, quantity: number) => {
    setOutputProducts(
      outputProducts.map((p) =>
        p.product_code === product_code ? { ...p, quantity } : p,
      ),
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Update the batch to include output products and mark as completed
      const updateResponse = await fetch(`/api/wip/${batch.batchNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          end_date: new Date().toISOString(),
          output: outputProducts.map((p) => ({
            product_code: p.product_code,
            quantity: p.quantity,
          })),
        }),
      });

      if (updateResponse.ok) {
        onSuccess();
        onOpenChange(false);
        // Trigger dashboard refresh
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete WIP Batch: {batch.batchNumber}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materials Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {batch.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex justify-between items-center p-2 bg-muted rounded-md"
                >
                  <span className="font-medium">{material.product.name}</span>
                  <span>
                    {material.quantity} {material.product.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Output Products</CardTitle>
          </CardHeader>
          <CardContent>
            {outputProducts.length > 0 ? (
              <div className="space-y-2">
                {outputProducts.map((product) => (
                  <div
                    key={product.product_code}
                    className="flex items-center space-x-2 p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{product.product_code}</div>
                      {product.expected_quantity && (
                        <div className="text-sm text-muted-foreground">
                          Expected: {product.expected_quantity} units
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={product.quantity || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = parseFloat(value);
                          updateOutputQuantity(
                            product.product_code,
                            isNaN(numValue) || numValue <= 0 ? 0 : numValue,
                          );
                        }}
                        className="w-24"
                        placeholder="Actual Qty"
                      />
                      <span className="text-sm text-muted-foreground">
                        units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center">
                No output products defined for this batch.
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
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              outputProducts.length === 0 ||
              outputProducts.some((p) => p.quantity <= 0)
            }
          >
            {loading ? "Completing..." : "Complete Batch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
