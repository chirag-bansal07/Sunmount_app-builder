import React, { useState } from "react";
import { X, Plus } from "lucide-react";
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

export default function NewOrder() {
  const [activeTab, setActiveTab] = useState("sales");
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      code: "PC733",
      name: "Widget A",
      description: "Standard widget",
      weight: "0.5 kg",
      price: "$10.00",
      quantity: "100",
    },
    {
      id: "2",
      code: "PC456",
      name: "Widget B",
      description: "Premium widget",
      weight: "0.7 kg",
      price: "$15.00",
      quantity: "50",
    },
    {
      id: "3",
      code: "PC789",
      name: "Widget C",
      description: "Basic widget",
      weight: "0.3 kg",
      price: "$5.00",
      quantity: "200",
    },
  ]);

  const [formData, setFormData] = useState({
    orderNumber: "",
    bomNumber: "",
    dateOfQuotation: "",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", { formData, products });
    // Add your submit logic here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Order</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchase">Purchase</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-8">
          {/* Order Details Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="orderNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Order Number
                </Label>
                <Input
                  id="orderNumber"
                  placeholder="Enter"
                  value={formData.orderNumber}
                  onChange={(e) =>
                    handleInputChange("orderNumber", e.target.value)
                  }
                  className="w-full"
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
                  placeholder="Enter BOMNo./name"
                  value={formData.bomNumber}
                  onChange={(e) =>
                    handleInputChange("bomNumber", e.target.value)
                  }
                  className="w-full"
                />
              </div>
            </div>

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
                className="w-full max-w-md"
              />
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
                className="w-full h-24 resize-none"
              />
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="customerName"
                  className="text-sm font-medium text-gray-700"
                >
                  Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter +91mobile number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full"
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
                  className="w-full"
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
                className="w-full h-24 resize-none"
              />
            </div>
          </div>

          {/* Product Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Product Information
            </h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Input
                            value={product.code}
                            onChange={(e) =>
                              updateProduct(product.id, "code", e.target.value)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0"
                            placeholder="Enter code"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={product.name}
                            onChange={(e) =>
                              updateProduct(product.id, "name", e.target.value)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={product.description}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0"
                            placeholder="Enter description"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={product.weight}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "weight",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0"
                            placeholder="Enter weight"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={product.price}
                            onChange={(e) =>
                              updateProduct(product.id, "price", e.target.value)
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0"
                            placeholder="Enter price"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={product.quantity}
                            onChange={(e) =>
                              updateProduct(
                                product.id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-full border-0 bg-transparent p-0 focus:ring-0"
                            placeholder="Enter quantity"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={addNewProduct}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>

            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
