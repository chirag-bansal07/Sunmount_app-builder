import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

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

interface ActualOutput {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  unit: string;
  quantity: number;
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
  const [actualOutputs, setActualOutputs] = useState<ActualOutput[]>([
    {
      id: Date.now().toString(),
      productCode: "",
      productName: "",
      description: "",
      unit: "",
      quantity: 0,
    },
  ]);

  const addActualOutput = () => {
    const newOutput: ActualOutput = {
      id: Date.now().toString(),
      productCode: "",
      productName: "",
      description: "",
      unit: "",
      quantity: 0,
    };
    setActualOutputs([...actualOutputs, newOutput]);
  };

  const updateActualOutput = (
    id: string,
    field: keyof ActualOutput,
    value: string | number,
  ) => {
    setActualOutputs(
      actualOutputs.map((output) =>
        output.id === id ? { ...output, [field]: value } : output,
      ),
    );
  };

  const removeActualOutput = (id: string) => {
    setActualOutputs(actualOutputs.filter((output) => output.id !== id));
  };

  const fetchOutputDetails = async (productCode: string, outputId: string) => {
    if (!productCode.trim()) return;

    try {
      const response = await fetch(`/api/inventory`);
      if (response.ok) {
        const products = await response.json();
        const foundProduct = products.find(
          (p: any) =>
            p.product_code.toLowerCase() === productCode.toLowerCase() ||
            p.name.toLowerCase() === productCode.toLowerCase(),
        );

        if (foundProduct) {
          setActualOutputs((prevOutputs) =>
            prevOutputs.map((output) =>
              output.id === outputId
                ? {
                    ...output,
                    productCode: foundProduct.product_code,
                    productName: foundProduct.name,
                    description: foundProduct.description || "",
                    unit: foundProduct.weight?.toString() || "units",
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

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate outputs
      const validOutputs = actualOutputs.filter(
        (output) => output.productName && output.quantity > 0,
      );

      if (validOutputs.length === 0) {
        alert("Please add at least one output product with quantity");
        setLoading(false);
        return;
      }

      // Mark the batch as completed with outputs
      const updateResponse = await fetch(`/api/wip/${batch.batchNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          end_date: new Date().toISOString(),
          outputs: validOutputs.map((output) => ({
            product_code:
              output.productCode || output.productName.toUpperCase(),
            quantity: output.quantity,
          })),
        }),
      });

      if (updateResponse.ok) {
        onSuccess();
        onOpenChange(false);
        setActualOutputs([
          {
            id: Date.now().toString(),
            productCode: "",
            productName: "",
            description: "",
            unit: "",
            quantity: 0,
          },
        ]);
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
