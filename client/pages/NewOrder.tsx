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
    alert("Order submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              New Order
            </h1>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-8"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1">
                <TabsTrigger
                  value="sales"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  Sales
                </TabsTrigger>
                <TabsTrigger
                  value="purchase"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  Purchase
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-8">
              {/* Order Details Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Enter BOMNo./name"
                      value={formData.bomNumber}
                      onChange={(e) =>
                        handleInputChange("bomNumber", e.target.value)
                      }
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    className="w-full max-w-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    className="w-full h-24 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Enter +91mobile number"
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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full h-24 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Product Information Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Information
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
                            Weight
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
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 border-r border-gray-200">
                              <Input
                                value={product.code}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "code",
                                    e.target.value,
                                  )
                                }
                                className="w-full border-0 bg-transparent p-0 focus:ring-0 text-sm"
                                placeholder="Enter code"
                              />
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <Input
                                value={product.name}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "name",
                                    e.target.value,
                                  )
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
                                placeholder="Enter weight"
                              />
                            </td>
                            <td className="px-4 py-3 border-r border-gray-200">
                              <Input
                                value={product.price}
                                onChange={(e) =>
                                  updateProduct(
                                    product.id,
                                    "price",
                                    e.target.value,
                                  )
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
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={addNewProduct}
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Add New Product
                </Button>

                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
