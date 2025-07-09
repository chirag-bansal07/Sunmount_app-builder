import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerSupplierForm from "@/components/CustomerSupplierForm";
import {
  Search,
  Plus,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Star,
} from "lucide-react";
import type { Customer, Supplier } from "@shared/api";

// Mock data - in a real app, this would come from API
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    companyName: "Global Manufacturing Co.",
    email: "john@globalmanuf.com",
    phone: "+1234567890",
    address: "123 Industrial Ave, City, State 12345",
    type: "customer",
    totalOrders: 25,
    totalValue: 125000,
    lastOrderDate: "2024-01-15T00:00:00Z",
    createdAt: "2023-06-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    notes: "Long-term customer, bulk orders",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    companyName: "TechStart Industries",
    email: "sarah@techstart.com",
    phone: "+1234567891",
    address: "456 Tech Blvd, Innovation City, State 67890",
    type: "customer",
    totalOrders: 12,
    totalValue: 75000,
    lastOrderDate: "2024-01-10T00:00:00Z",
    createdAt: "2023-08-20T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    notes: "Precision requirements, quick turnaround",
  },
  {
    id: "3",
    name: "Mike Wilson",
    companyName: "BuildCo Ltd",
    email: "mike@buildco.com",
    phone: "+1234567892",
    address: "789 Construction St, Builder Town, State 11111",
    type: "customer",
    totalOrders: 8,
    totalValue: 42000,
    lastOrderDate: "2023-12-28T00:00:00Z",
    createdAt: "2023-09-10T00:00:00Z",
    updatedAt: "2023-12-28T00:00:00Z",
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "David Chen",
    companyName: "Steel World Suppliers",
    email: "david@steelworld.com",
    phone: "+1234567893",
    address: "321 Steel Ave, Metal City, State 22222",
    type: "supplier",
    totalPurchases: 45,
    totalValue: 250000,
    lastPurchaseDate: "2024-01-12T00:00:00Z",
    createdAt: "2023-03-15T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
    rating: 5,
    notes: "Reliable supplier, quality materials",
  },
  {
    id: "2",
    name: "Lisa Rodriguez",
    companyName: "Aluminum Express",
    email: "lisa@aluminumexpress.com",
    phone: "+1234567894",
    address: "654 Aluminum Lane, Metal Valley, State 33333",
    type: "supplier",
    totalPurchases: 28,
    totalValue: 180000,
    lastPurchaseDate: "2024-01-08T00:00:00Z",
    createdAt: "2023-05-20T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
    rating: 4,
    notes: "Good prices, fast delivery",
  },
];

export default function CustomersSuppliers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState(mockCustomers);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<
    Customer | Supplier | null
  >(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<
    Customer | Supplier | null
  >(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleSave = (data: Partial<Customer> | Partial<Supplier>) => {
    if (activeTab === "customers") {
      const customerData = data as Customer;
      if (editingContact) {
        // Update existing customer
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === editingContact.id ? customerData : customer,
          ),
        );
      } else {
        // Add new customer
        setCustomers((prev) => [...prev, customerData]);
      }
    } else {
      const supplierData = data as Supplier;
      if (editingContact) {
        // Update existing supplier
        setSuppliers((prev) =>
          prev.map((supplier) =>
            supplier.id === editingContact.id ? supplierData : supplier,
          ),
        );
      } else {
        // Add new supplier
        setSuppliers((prev) => [...prev, supplierData]);
      }
    }
    setShowForm(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Customer | Supplier) => {
    setEditingContact(contact);
    setActiveTab(contact.type === "customer" ? "customers" : "suppliers");
    setShowForm(true);
    setSelectedContact(null);
  };

  const handleViewOrders = (contact: Customer | Supplier) => {
    // Navigate to order history with customer/supplier filter
    navigate(
      `/order-history?${contact.type}=${encodeURIComponent(contact.companyName)}`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Customers & Suppliers
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New {activeTab === "customers" ? "Customer" : "Supplier"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        {/* Search */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(customer)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {customer.name}
                        </h3>
                        <p className="text-gray-600">{customer.companyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">
                        {customer.totalOrders} Orders
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatCurrency(customer.totalValue)}
                    </div>
                    {customer.lastOrderDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last: {formatDate(customer.lastOrderDate)}
                      </div>
                    )}
                  </div>

                  {customer.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      {customer.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No customers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or add a new customer.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <div className="grid gap-4">
            {filteredSuppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(supplier)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {supplier.name}
                        </h3>
                        <p className="text-gray-600">{supplier.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {supplier.rating && (
                        <div className="flex items-center">
                          {renderStars(supplier.rating)}
                        </div>
                      )}
                      <Badge variant="secondary">
                        {supplier.totalPurchases} Purchases
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {supplier.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {formatCurrency(supplier.totalValue)}
                    </div>
                    {supplier.lastPurchaseDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last: {formatDate(supplier.lastPurchaseDate)}
                      </div>
                    )}
                  </div>

                  {supplier.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      {supplier.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No suppliers found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or add a new supplier.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {selectedContact.name}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {selectedContact.companyName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedContact(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedContact.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedContact.phone}
                  </div>
                </div>
                <div className="mt-2 flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  <span className="text-sm">{selectedContact.address}</span>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h4 className="font-semibold mb-2">Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      Total{" "}
                      {selectedContact.type === "customer"
                        ? "Orders"
                        : "Purchases"}
                    </p>
                    <p className="text-xl font-bold">
                      {selectedContact.type === "customer"
                        ? selectedContact.totalOrders
                        : selectedContact.totalPurchases}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(selectedContact.totalValue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating for suppliers */}
              {"rating" in selectedContact && selectedContact.rating && (
                <div>
                  <h4 className="font-semibold mb-2">Rating</h4>
                  <div className="flex items-center">
                    {renderStars(selectedContact.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedContact.rating}/5
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedContact.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedContact.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => handleEdit(selectedContact)}
                >
                  Edit
                </Button>
                <Button variant="outline" className="flex-1">
                  View{" "}
                  {selectedContact.type === "customer" ? "Orders" : "Purchases"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <CustomerSupplierForm
          type={activeTab === "customers" ? "customer" : "supplier"}
          onClose={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          onSave={handleSave}
          initialData={editingContact || undefined}
        />
      )}
    </div>
  );
}
