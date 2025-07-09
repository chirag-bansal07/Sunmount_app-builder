import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Mark the batch as completed
      const updateResponse = await fetch(`/api/wip/${batch.batchNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          end_date: new Date().toISOString(),
        }),
      });

      if (updateResponse.ok) {
        onSuccess();
        onOpenChange(false);
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

        {/* Expected Outputs (read-only) */}
        {batch.outputs && batch.outputs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expected Outputs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {batch.outputs.map((output, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-green-50 rounded-md"
                  >
                    <span className="font-medium">
                      {output.product?.name || output.product?.code}
                    </span>
                    <span>
                      {output.quantity} {output.product?.unit || "units"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Completing..." : "Complete Batch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
