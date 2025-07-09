import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  weight: string;
  price: string;
  quantity: string;
}

export default function NewQuotation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sales");
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      code: "",
      name: "",
      description: "",
      weight: "",
      price: "",
      quantity: "",
    },
  ]);

  const [formData, setFormData] = useState({
    quotationNumber: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    bomNumber: "",
    dateOfQuotation: new Date().toISOString().split("T")[0],
    validUntil: "",
    notes: "",
    customerName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const removeProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const addNewProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      code: "",
      name: "",
      description: "",
      weight: "",
      price: "",
      quantity: "",
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, [field]: value } : product,
      ),
    );
  };

  const fetchProductDetails = async (
    productCode: string,
    productId: string,
  ) => {
    if (!productCode.trim()) return;

    try {
      const response = await fetch(`/api/inventory`);
      if (response.ok) {
        const products = await response.json();
        const foundProduct = products.find(
          (p: any) =>
            p.product_code.toLowerCase() === productCode.toLowerCase() ||
            p.name.toLowerCase() === productCode.toLowerCase(),
        );

        if (foundProduct) {
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.id === productId
                ? {
                    ...product,
                    code: foundProduct.product_code,
                    name: foundProduct.name,
                    description: foundProduct.description || "",
                    weight: foundProduct.weight?.toString() || "1",
                    price: foundProduct.price?.toString() || "0",
                  }
                : product,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const fetchCustomerDetails = async (companyName: string) => {
    if (!companyName.trim()) return;

    try {
      const response = await fetch(`/api/customers`);
      if (response.ok) {
        const customers = await response.json();
        const foundCustomer = customers.find(
          (c: any) =>
            c.company?.toLowerCase() === companyName.toLowerCase() ||
            c.name?.toLowerCase() === companyName.toLowerCase(),
        );

        if (foundCustomer) {
          setFormData((prev) => ({
            ...prev,
            customerName: foundCustomer.name || prev.customerName,
            phoneNumber: foundCustomer.phone || prev.phoneNumber,
            email: foundCustomer.email || prev.email,
            address: foundCustomer.address || prev.address,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const price = parseFloat(product.price.replace(/[^0-9.-]+/g, "")) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      const validProducts = products.filter(
        (p) => p.name && p.price && p.quantity,
      );

      if (!formData.customerName || validProducts.length === 0) {
        alert("Please fill in customer name and at least one product");
        return;
      }

      const quotationData = {
        customerName: formData.customerName,
        customerEmail: formData.email,
        customerPhone: formData.phoneNumber,
        items: validProducts.map((product) => ({
          productId: product.code || product.name.toUpperCase(),
          productName: product.name,
          productCode: product.code || product.name.toUpperCase(),
          quantity: parseFloat(product.quantity),
          unitPrice: parseFloat(product.price.replace(/[^0-9.-]+/g, "")),
        })),
        notes: formData.notes,
      };

      // First create customer if it doesn't exist
      if (formData.customerName && formData.email) {
        await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: formData.customerName,
            name: formData.customerName,
            email: formData.email,
            phone: formData.phoneNumber,
            address: formData.address,
          }),
        });
      }

      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotationData),
      });

      if (response.ok) {
        navigate("/quotations");
      } else {
        const error = await response.json();
        alert(`Failed to create quotation: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      alert("Failed to create quotation");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/quotations")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quotations
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">New Quotation</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="space-y-8">
          {/* Quotation Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1">
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Sales Quotation
              </TabsTrigger>
              <TabsTrigger
                value="purchase"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Purchase Quotation
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quotation Details Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quotation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="quotationNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Quotation Number
                </Label>
                <Input
                  id="quotationNumber"
                  placeholder="Enter quotation number"
                  value={formData.quotationNumber}
                  onChange={(e) =>
                    handleInputChange("quotationNumber", e.target.value)
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bomNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  BOM Number
                </Label>
                <Input
                  id="bomNumber"
                  placeholder="Enter BOM No./name"
                  value={formData.bomNumber}
                  onChange={(e) =>
                    handleInputChange("bomNumber", e.target.value)
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="dateOfQuotation"
                  className="text-sm font-medium text-gray-700"
                >
                  Date of Quotation
                </Label>
                <Input
                  id="dateOfQuotation"
                  type="date"
                  value={formData.dateOfQuotation}
                  onChange={(e) =>
                    handleInputChange("dateOfQuotation", e.target.value)
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="validUntil"
                  className="text-sm font-medium text-gray-700"
                >
                  Valid Until
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    handleInputChange("validUntil", e.target.value)
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-gray-700"
              >
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full h-24 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === "sales" ? "Customer" : "Supplier"} Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="customerName"
                  className="text-sm font-medium text-gray-700"
                >
                  Contact Name
                </Label>
                <Input
                  id="customerName"
                  placeholder={`Enter ${activeTab === "sales" ? "customer" : "supplier"} name`}
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="companyName"
                  className="text-sm font-medium text-gray-700"
                >
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  onBlur={(e) => fetchCustomerDetails(e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="Enter address..."
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full h-24 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Product Information Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === "sales" ? "Product" : "Item"} Information
            </h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Product Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Weight/Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={product.code}
                            onChange={(e) =>
                              updateProduct(product.id, "code", e.target.value)
                            }
                            onBlur={(e) =>
                              fetchProductDetails(e.target.value, product.id)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter code"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={product.name}
                            onChange={(e) =>
                              updateProduct(product.id, "name", e.target.value)
                            }
                            onBlur={(e) =>
                              fetchProductDetails(e.target.value, product.id)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={product.description}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter description"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={product.weight}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "weight",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter weight/unit"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={product.price}
                            onChange={(e) =>
                              updateProduct(product.id, "price", e.target.value)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter price"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <Input
                            value={product.quantity}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                            placeholder="Enter quantity"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                            disabled={products.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-end">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="text-xl font-bold">
                    ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <Button
              onClick={addNewProduct}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add New {activeTab === "sales" ? "Product" : "Item"}
            </Button>

            <div className="flex gap-2 sm:ml-auto">
              <Button
                onClick={() => navigate("/quotations")}
                variant="outline"
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
