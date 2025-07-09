import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ShoppingCart,
  Settings,
  History,
  Plus,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockItems: number;
  wipBatches: number;
}

interface WipBatch {
  id: string;
  batchNumber: string;
  status: string;
  startDate: string;
  endDate?: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    wipBatches: 0,
  });
  const [recentWipBatches, setRecentWipBatches] = useState<WipBatch[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [inventoryResponse, wipResponse] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/wip"),
      ]);

      if (inventoryResponse.ok && wipResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        const wipData = await wipResponse.json();

        // Transform inventory data to match expected format
        const products = inventoryData.map((product: any) => ({
          id: product.product_code,
          code: product.product_code,
          name: product.name,
          quantity: product.quantity,
          unitPrice: product.price,
          unit: "units",
        }));

        const lowStock = products.filter(
          (product: Product) => product.quantity < 10,
        );

        const totalInventoryValue = products.reduce(
          (sum: number, product: Product) =>
            sum + product.quantity * product.unitPrice,
          0,
        );

        setStats({
          totalProducts: products.length,
          totalInventoryValue,
          lowStockItems: lowStock.length,
          wipBatches: wipData.filter(
            (batch: WipBatch) => batch.status === "IN_PROGRESS",
          ).length,
        });

        setRecentWipBatches(wipData.slice(0, 3));
        setLowStockProducts(lowStock.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/quotations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Button>
          </Link>
          <Link to="/work-in-progress/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add to WIP
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Total items in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalInventoryValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active WIP Batches
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wipBatches}</div>
            <p className="text-xs text-muted-foreground">In production</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/inventory">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold">Inventory</h3>
                <p className="text-sm text-muted-foreground">Manage products</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/wip">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <Settings className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold">WIP Batches</h3>
                <p className="text-sm text-muted-foreground">
                  Production batches
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/quotations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <FileText className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold">Quotations</h3>
                <p className="text-sm text-muted-foreground">Manage quotes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/current-orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <ShoppingCart className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold">Current Orders</h3>
                <p className="text-sm text-muted-foreground">Active orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent WIP Batches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent WIP Batches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWipBatches.length > 0 ? (
              recentWipBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{batch.batchNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(batch.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        batch.status === "COMPLETED" ? "default" : "secondary"
                      }
                    >
                      {batch.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No WIP batches yet
              </p>
            )}
            <Link to="/wip">
              <Button variant="outline" className="w-full mt-3">
                View All WIP Batches
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {product.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      {product.quantity} {product.unit}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      Low Stock
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                All products well stocked
              </p>
            )}
            <Link to="/inventory">
              <Button variant="outline" className="w-full mt-3">
                Manage Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/inventory" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link to="/wip" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Create WIP Batch
              </Button>
            </Link>
            <Link to="/quotations/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                New Quotation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
