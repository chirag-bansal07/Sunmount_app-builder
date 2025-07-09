import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Settings,
  Calendar,
  Package,
  ArrowRight,
  Factory,
} from "lucide-react";
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

export default function WorkInProgress() {
  const [wipBatches, setWipBatches] = useState<WipBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<WipBatch | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchWipBatches();
  }, []);

  const fetchWipBatches = async () => {
    try {
      const response = await fetch("/api/wip");
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match frontend interface
        const transformedData = data.map((batch: any) => ({
          id: batch.id.toString(),
          batchNumber: batch.batch_number,
          status: batch.status.toUpperCase(),
          startDate: batch.start_date,
          endDate: batch.end_date,
          notes: "",
          materials: Array.isArray(batch.raw_materials)
            ? batch.raw_materials.map((mat: any, index: number) => ({
                id: index.toString(),
                quantity: mat.quantity,
                product: {
                  id: mat.product_code,
                  code: mat.product_code,
                  name: mat.product_code, // Will be enhanced with product lookup
                  unit: "units",
                },
              }))
            : [],
          outputs: Array.isArray(batch.output)
            ? batch.output.map((out: any, index: number) => ({
                id: index.toString(),
                quantity: out.quantity,
                product: {
                  id: out.product_code,
                  code: out.product_code,
                  name: out.product_code, // Will be enhanced with product lookup
                  unit: "units",
                },
              }))
            : [],
        }));
        setWipBatches(transformedData);
      } else {
        console.error("Failed to fetch WIP batches");
      }
    } catch (error) {
      console.error("Error fetching WIP batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWipBatches = wipBatches.filter((batch) => {
    const matchesSearch = batch.batchNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || batch.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateMaterialCost = (materials: WipMaterial[]) => {
    return materials.reduce((total, material) => {
      return total + material.quantity * (material.product?.unitPrice || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading WIP batches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Work in Progress</h1>
        <Link to="/work-in-progress/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add to WIP
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* WIP Batches List */}
      <div className="grid gap-4">
        {filteredWipBatches.map((batch) => (
          <Card
            key={batch.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedBatch(batch)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Factory className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {batch.batchNumber}
                    </h3>
                    <p className="text-gray-600">
                      Materials: {batch.materials.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(batch.status)}>
                    {batch.status.replace("_", " ")}
                  </Badge>
                  {batch.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatch(batch);
                        setIsCompleteDialogOpen(true);
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Started: {formatDate(batch.startDate)}
                </div>
                {batch.endDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    Completed: {formatDate(batch.endDate)}
                  </div>
                )}
                <div className="flex items-center text-sm font-medium">
                  <Settings className="h-4 w-4 mr-2" />
                  Materials: $
                  {calculateMaterialCost(batch.materials).toFixed(2)}
                </div>
              </div>

              {batch.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  {batch.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWipBatches.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No WIP batches found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters, or create a new WIP batch.
            </p>
            <Link to="/work-in-progress/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add to WIP
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {selectedBatch && (
        <CompleteWipBatchDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
          batch={selectedBatch}
          onSuccess={fetchWipBatches}
        />
      )}

      {/* Batch Details Modal */}
      {selectedBatch && !isCompleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {selectedBatch.batchNumber}
                  </CardTitle>
                  <Badge
                    variant={getStatusColor(selectedBatch.status)}
                    className="mt-2"
                  >
                    {selectedBatch.status.replace("_", " ")}
                  </Badge>
                </div>
                <Button variant="ghost" onClick={() => setSelectedBatch(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Start Date:</span>{" "}
                    {formatDateTime(selectedBatch.startDate)}
                  </div>
                  {selectedBatch.endDate && (
                    <div>
                      <span className="text-gray-600">End Date:</span>{" "}
                      {formatDateTime(selectedBatch.endDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Used */}
              <div>
                <h4 className="font-semibold mb-3">Materials Used</h4>
                <div className="space-y-2">
                  {selectedBatch.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {material.product.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Code: {material.product.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {material.quantity} {material.product.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs (if completed) */}
              {selectedBatch.outputs.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Outputs Produced</h4>
                  <div className="space-y-2">
                    {selectedBatch.outputs.map((output) => (
                      <div
                        key={output.id}
                        className="flex justify-between items-center p-3 bg-green-50 rounded"
                      >
                        <div>
                          <div className="font-medium">
                            {output.product.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Code: {output.product.code}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {output.quantity} {output.product.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBatch.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded">
                    {selectedBatch.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedBatch.status === "IN_PROGRESS" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setIsCompleteDialogOpen(true);
                    }}
                  >
                    Complete Batch
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedBatch(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
