import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Factory,
  ArrowRight,
} from "lucide-react";
import { CompleteWipBatchDialog } from "@/components/CompleteWipBatchDialog";

interface Product {
  id: string;
  code: string;
  name?: string;
  unit: string;
  unitPrice?: number;
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
interface CompleteWipBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: WipBatch;
  onSuccess: () => void;
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

  async function fetchWipBatches() {
    try {
      const res = await fetch("/api/wip");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const transformed: WipBatch[] = data.map((b: any) => ({
        id: b.id.toString(),
        batchNumber: b.batch_number,
        status: b.status,
        startDate: b.start_date,
        endDate: b.end_date || undefined,
        notes: b.notes || undefined,
        materials: Array.isArray(b.raw_materials)
          ? b.raw_materials.map((m: any, i: number) => ({
              id: `${b.batch_number}-mat-${i}`,
              quantity: m.quantity,
              product: {
                id: m.product_code,
                code: m.product_code,
                name: m.product_name, // if your backend provides name
                unit: "units",
                unitPrice: m.unit_price,
              },
            }))
          : [],
        outputs: Array.isArray(b.output)
          ? b.output.map((o: any, i: number) => ({
              id: `${b.batch_number}-out-${i}`,
              quantity: o.quantity,
              product: {
                id: o.product_code,
                code: o.product_code,
                name: o.product_name,
                unit: "units",
              },
            }))
          : [],
      }));
      setWipBatches(transformed);
    } catch {
      console.error("Failed to fetch WIP batches");
    } finally {
      setLoading(false);
    }
  }

  // Filter
  const filtered = wipBatches.filter((b) => {
    const matchesSearch = b.batchNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || b.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helpers
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN");
  const formatDateTime = (s: string) =>
    new Date(s).toLocaleString("en-IN");
  const calcCost = (mats: WipMaterial[]) =>
    mats.reduce((sum, m) => sum + m.quantity * (m.product.unitPrice || 0), 0);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "IN_PROGRESS":
        return "default";
      case "COMPLETED":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading WIP batches…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Work in Progress</h1>
        <Link to="/work-in-progress/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add to WIP
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search batches…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_progress">
                  In Progress
                </SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Grid */}
      <div className="grid gap-4">
        {filtered.map((batch) => {
          // prepare summary stats by mapping
          const stats = [
            {
              key: "start",
              icon: <Calendar className="h-4 w-4 text-gray-600" />,
              label: "Started",
              value: formatDate(batch.startDate),
            },
            batch.endDate && {
              key: "end",
              icon: <Package className="h-4 w-4 text-gray-600" />,
              label: "Completed",
              value: formatDate(batch.endDate),
            },
            {
              key: "cost",
              icon: <Settings className="h-4 w-4 text-gray-600" />,
              label: "Materials Cost",
              value: `₹${calcCost(batch.materials).toFixed(2)}`,
            },
          ].filter(Boolean) as {
            key: string;
            icon: React.ReactNode;
            label: string;
            value: string;
          }[];

          // join output names
          const outputNames = batch.outputs
            .map((o) => o.product.name || o.product.code)
            .join(", ");

          return (
            <Card
              key={batch.id}
              onClick={() => setSelectedBatch(batch)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                {/* Header row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <Factory className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {batch.batchNumber}
                      </h3>
                      {outputNames ? (
                        <p className="text-gray-600">
                          Outputs: {outputNames}
                        </p>
                      ) : (
                        <p className="text-gray-600 italic">
                          No outputs defined
                        </p>
                      )}
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

                {/* Stats row */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center text-sm text-gray-600"
                    >
                      {s.icon}
                      <span className="ml-2">
                        {s.label}: {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {batch.notes && (
                  <div className="mt-3 rounded bg-gray-50 p-2 text-sm">
                    {batch.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Factory className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium">
                No WIP batches found
              </h3>
              <p className="mb-4 text-gray-600">
                Adjust your search or filters, or add a new batch.
              </p>
              <Link to="/work-in-progress/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add to WIP
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Complete Dialog */}
      {selectedBatch && (
        <CompleteWipBatchDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
          batch={selectedBatch}
          onSuccess={() => {
            setIsCompleteDialogOpen(false);
            fetchWipBatches();
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedBatch && !isCompleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-auto">
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {selectedBatch.batchNumber}
                </CardTitle>
                <Badge variant={getStatusColor(selectedBatch.status)}>
                  {selectedBatch.status.replace("_", " ")}
                </Badge>
              </div>
              <Button variant="ghost" onClick={() => setSelectedBatch(null)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeline */}
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Calendar className="inline-block h-4 w-4 mr-2 text-gray-600" />
                    Start: {formatDateTime(selectedBatch.startDate)}
                  </div>
                  {selectedBatch.endDate && (
                    <div>
                      <Package className="inline-block h-4 w-4 mr-2 text-gray-600" />
                      End: {formatDateTime(selectedBatch.endDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Used */}
              <div>
                <h4 className="mb-3 font-semibold">Materials Used</h4>
                <div className="space-y-2">
                  {selectedBatch.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="flex justify-between items-center rounded bg-gray-50 p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {mat.product.name || mat.product.code}
                        </div>
                        {mat.product.name && (
                          <div className="text-sm text-gray-600">
                            Code: {mat.product.code}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {mat.quantity} {mat.product.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs Produced */}
              {selectedBatch.outputs.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Outputs Produced</h4>
                  <div className="space-y-2">
                    {selectedBatch.outputs.map((out) => (
                      <div
                        key={out.id}
                        className="flex justify-between items-center rounded bg-green-50 p-3"
                      >
                        <div>
                          <div className="font-medium">
                            {out.product.name || out.product.code}
                          </div>
                          {out.product.name && (
                            <div className="text-sm text-gray-600">
                              Code: {out.product.code}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {out.quantity} {out.product.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedBatch.status === "IN_PROGRESS" && (
                  <Button
                    className="flex-1"
                    onClick={() => setIsCompleteDialogOpen(true)}
                  >
                    Complete Batch
                    <ArrowRight className="ml-2 h-4 w-4" />
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
