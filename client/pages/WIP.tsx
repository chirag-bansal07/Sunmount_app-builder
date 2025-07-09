import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Factory, CheckCircle } from "lucide-react";
import { CreateWipBatchDialog } from "@/components/CreateWipBatchDialog";
import { CompleteWipBatchDialog } from "@/components/CompleteWipBatchDialog";

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

interface WipOutput {
  id: string;
  quantity: number;
  product: Product;
}

interface WipBatch {
  id: string;
  batchNumber: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate?: string;
  notes?: string;
  materials: WipMaterial[];
  outputs: WipOutput[];
}

export default function WIP() {
  const [batches, setBatches] = useState<WipBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<WipBatch | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchWipBatches();
  }, []);

  const fetchWipBatches = async () => {
    try {
      const response = await fetch("/api/wip-batches");
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      } else {
        console.error("Failed to fetch WIP batches");
      }
    } catch (error) {
      console.error("Error fetching WIP batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const inProgressBatches = batches.filter(
    (batch) => batch.status === "IN_PROGRESS",
  );
  const completedBatches = batches.filter(
    (batch) => batch.status === "COMPLETED",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading WIP batches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work in Progress</h1>
          <p className="text-muted-foreground">
            Manage production batches and track material usage
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Batch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Progress Batches
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressBatches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Batches
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBatches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* WIP Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Materials Used</TableHead>
                  <TableHead>Outputs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">
                      {batch.batchNumber}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          batch.status === "COMPLETED"
                            ? "default"
                            : batch.status === "IN_PROGRESS"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {batch.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(batch.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {batch.materials.map((material, index) => (
                          <div key={material.id}>
                            {material.product.name}: {material.quantity}{" "}
                            {material.product.unit}
                            {index < batch.materials.length - 1 && ", "}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {batch.outputs.length > 0 ? (
                          batch.outputs.map((output, index) => (
                            <div key={output.id}>
                              {output.product.name}: {output.quantity}{" "}
                              {output.product.unit}
                              {index < batch.outputs.length - 1 && ", "}
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">
                            No outputs yet
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch.status === "IN_PROGRESS" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBatch(batch);
                            setIsCompleteDialogOpen(true);
                          }}
                        >
                          Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateWipBatchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchWipBatches}
      />

      {selectedBatch && (
        <CompleteWipBatchDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
          batch={selectedBatch}
          onSuccess={fetchWipBatches}
        />
      )}
    </div>
  );
}
