import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersSuppliers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    fetchSuppliers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        console.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/suppliers`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        console.error("Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customers and suppliers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Customers & Suppliers
        </h1>
        <Button onClick={() => navigate("/quotations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Contact via Quotation
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Suppliers ({suppliers.length})
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          {filteredCustomers.length > 0 ? (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {customer.name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {customer.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Added: {formatDate(customer.createdAt)}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            navigate(`/order-history?customer=${customer.name}`)
                          }
                        >
                          View Orders
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No customers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Customers will be automatically created when you create
                  quotations.
                </p>
                <Button onClick={() => navigate("/quotations/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Quotation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          {filteredSuppliers.length > 0 ? (
            <div className="grid gap-4">
              {filteredSuppliers.map((supplier) => (
                <Card
                  key={supplier.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Building className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {supplier.name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {supplier.email}
                            </div>
                            {supplier.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {supplier.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Added: {formatDate(supplier.createdAt)}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            navigate(`/order-history?supplier=${supplier.name}`)
                          }
                        >
                          View Purchases
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No suppliers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Suppliers will be automatically created when you create
                  purchase quotations.
                </p>
                <Button onClick={() => navigate("/quotations/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Purchase Quotation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
