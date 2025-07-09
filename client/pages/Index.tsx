import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">
          Inventory Management System
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          Manage your quotations, orders, work in progress, and inventory with
          our comprehensive management system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/new-order">
            <Button
              variant="outline"
              className="px-8 py-3 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Create New Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
