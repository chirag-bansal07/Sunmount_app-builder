import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">
          Order Management System
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          Streamline your order processing with our comprehensive form
          management system.
        </p>
        <Link to="/new-order">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
            Create New Order
          </Button>
        </Link>
      </div>
    </div>
  );
}
