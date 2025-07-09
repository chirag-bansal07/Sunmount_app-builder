import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, AlertCircle } from "lucide-react";

const ADMIN_CREDENTIALS = {
  id: "Admin123",
  password: "Sunmount1800",
};

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      formData.id === ADMIN_CREDENTIALS.id &&
      formData.password === ADMIN_CREDENTIALS.password
    ) {
      // Store login status in localStorage
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("adminId", formData.id);

      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please check your Admin ID and password.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Admin Login
          </CardTitle>
          <p className="text-slate-600">
            Access the Inventory Management System
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="id" className="text-sm font-medium">
                Admin ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="id"
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleInputChange("id", e.target.value)}
                  placeholder="Enter your admin ID"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Development hint */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Demo Credentials:</p>
            <p className="text-xs text-gray-600">
              ID: <span className="font-mono">Admin123</span>
            </p>
            <p className="text-xs text-gray-600">
              Password: <span className="font-mono">Sunmount1800</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
