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

// Mock data - in a real app, this would come from API
const dashboardStats = {
  totalQuotations: 24,
  pendingQuotations: 8,
  activeOrders: 12,
  wipItems: 5,
  completedOrders: 156,
  totalRevenue: 485000,
  monthlyRevenue: 82000,
};

const recentQuotations = [
  {
    id: "1",
    quotationNumber: "QT-2024-001",
    customerName: "Acme Corp",
    amount: 15000,
    status: "pending",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    quotationNumber: "QT-2024-002",
    customerName: "TechStart Inc",
    amount: 8500,
    status: "approved",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    quotationNumber: "QT-2024-003",
    customerName: "BuildCo Ltd",
    amount: 22000,
    status: "pending",
    createdAt: "2024-01-13",
  },
];

const recentOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerName: "Global Manufacturing",
    status: "in_progress",
    expectedDelivery: "2024-01-25",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerName: "Metro Industries",
    status: "current",
    expectedDelivery: "2024-01-28",
  },
];

const wipItems = [
  {
    id: "1",
    batchNumber: "BATCH-001",
    orderNumber: "ORD-2024-001",
    status: "in_progress",
    expectedCompletion: "2024-01-22",
  },
  {
    id: "2",
    batchNumber: "BATCH-002",
    orderNumber: "ORD-2024-003",
    status: "planned",
    expectedCompletion: "2024-01-26",
  },
];

export default function Dashboard() {
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
              Total Quotations
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalQuotations}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingQuotations} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.activeOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Work in Progress
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.wipItems}</div>
            <p className="text-xs text-muted-foreground">
              Manufacturing batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardStats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/quotations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
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
              <ShoppingCart className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold">Current Orders</h3>
                <p className="text-sm text-muted-foreground">Active orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/work-in-progress">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <Package className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold">Work in Progress</h3>
                <p className="text-sm text-muted-foreground">Manufacturing</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/order-history">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center p-4">
              <History className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold">Order History</h3>
                <p className="text-sm text-muted-foreground">Past orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{quotation.quotationNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {quotation.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${quotation.amount.toLocaleString()}
                  </p>
                  <Badge
                    variant={
                      quotation.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {quotation.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Link to="/quotations">
              <Button variant="outline" className="w-full mt-3">
                View All Quotations
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{order.expectedDelivery}</p>
                  <Badge
                    variant={
                      order.status === "in_progress" ? "default" : "secondary"
                    }
                  >
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
            <Link to="/current-orders">
              <Button variant="outline" className="w-full mt-3">
                View All Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Work in Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work in Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wipItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.batchNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{item.expectedCompletion}</p>
                  <Badge
                    variant={
                      item.status === "in_progress" ? "default" : "outline"
                    }
                  >
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
            <Link to="/work-in-progress">
              <Button variant="outline" className="w-full mt-3">
                View All WIP
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
