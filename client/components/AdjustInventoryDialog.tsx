import { useState } from "react";
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

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
}

interface AdjustInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onSuccess: () => void;
}

export function AdjustInventoryDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: AdjustInventoryDialogProps) {
  const [adjustment, setAdjustment] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform to backend format for inventory update
      const updateData = {
        product_code: product.code, // Use product code instead of ID
        qtyDelta: adjustment, // Backend expects qtyDelta for quantity change
      };

      const response = await fetch("/api/inventory/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        onSuccess();
        onOpenChange(false);
        setAdjustment(0);
        setNotes("");
      } else {
        // Handle error response safely
        let errorMessage = "Failed to adjust inventory";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error("Failed to adjust inventory:", errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      alert(
        "Network error occurred. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const newQuantity = product.quantity + adjustment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                Code: {product.code}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Quantity: {product.quantity} {product.unit}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment">
              Adjustment Quantity (+ to add, - to subtract)
            </Label>
            <Input
              id="adjustment"
              type="number"
              step="0.01"
              value={adjustment === 0 ? "" : adjustment}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || value === "-" || value === "+") {
                  setAdjustment(0);
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    setAdjustment(numValue);
                  }
                }
              }}
              placeholder="Enter positive or negative number (e.g., -5, 10)"
              required
            />
            <p className="text-xs text-gray-500">
              Use negative numbers to subtract inventory (e.g., -10), positive
              numbers to add (e.g., +15)
            </p>
          </div>

          <div className="space-y-2">
            <Label>New Quantity</Label>
            <div
              className={`p-2 rounded-md text-center font-medium ${
                newQuantity < 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {newQuantity} {product.unit}
            </div>
            {newQuantity < 0 && (
              <p className="text-sm text-destructive">
                Warning: This adjustment would result in negative inventory.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setAdjustment(0);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || adjustment === 0 || newQuantity < 0}
            >
              {loading ? "Adjusting..." : "Adjust Inventory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
