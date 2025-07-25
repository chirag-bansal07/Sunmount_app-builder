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
const API_URL = import.meta.env.VITE_API_URL;
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
  notes?: string | null;
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
      const predefinedOutputs = batch.outputs || [];
      setOutputProducts(
        predefinedOutputs.map((output) => ({
          product_code: output.product_code,
          quantity: output.quantity || 0,
          expected_quantity: output.expected_quantity || 0,
        }))
      );
    }
  }, [open, batch]);

  const updateOutputQuantity = (product_code: string, quantity: number | undefined) => {
    setOutputProducts((prev) =>
      prev.map((p) =>
        p.product_code === product_code ? { ...p, quantity } : p
      )
    );
  };

const handleSubmit = async () => {
  if (batch.status === "completed") {
    alert("This batch is already marked as completed.");
    return;
  }

  setLoading(true);
  try {
    const validOutputs = outputProducts
      .filter(
        (p) =>
          typeof p.quantity === "number" &&
          p.quantity > 0 &&
          !!p.product_code?.trim()
      )
      .map((p) => ({
        product_code: p.product_code,
        quantity: p.quantity,
      }));

    const updateResponse = await fetch(`${API_URL}/api/wip/${batch.batchNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        end_date: new Date().toISOString(),
        output: validOutputs,
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
                  <span className="font-medium">
                      {material.product.name} ({material.product.code})
                    </span>

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
                        min="0"
                        step="1"
                        value={product.quantity || ""}
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          const num = Number(raw);
                          updateOutputQuantity(
                            product.product_code,
                            raw === "" || isNaN(num) || num <= 0 ? undefined : num
                          );
                        }}  
                        className="w-24"
                        placeholder="Actual Qty"
                      />
                      <span className="text-sm text-muted-foreground">units</span>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Batch Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground italic p-2">
              {batch.notes?.trim()
                ? batch.notes
                : "No notes provided."}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              batch.status === "completed" ||
              outputProducts.length === 0 ||
              outputProducts.some((p) => typeof p.quantity !== "number" || p.quantity <= 0)
            }
          >
            {loading ? "Completing..." : batch.status === "completed" ? "Already Completed" : "Complete Batch"}
          </Button>
        
        </div>
      </DialogContent>
    </Dialog>
  );
}
