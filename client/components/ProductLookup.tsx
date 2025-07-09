import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "lucide-react";

interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
}

interface ProductLookupProps {
  onProductSelect: (product: Product) => void;
  placeholder?: string;
}

export function ProductLookup({
  onProductSelect,
  placeholder = "Enter product code...",
}: ProductLookupProps) {
  const [searchCode, setSearchCode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchCode) {
      const filtered = products.filter((product) => {
        const matchesSearch =
          product.code.toLowerCase().includes(searchCode.toLowerCase()) ||
          product.name.toLowerCase().includes(searchCode.toLowerCase());

        return matchesSearch;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchCode, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedData = data.map((product: any) => ({
          id: product.product_code,
          code: product.product_code,
          name: product.name,
          quantity: product.quantity,
          unit: "units", // Default unit
        }));
        setProducts(transformedData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductSelect = async (product: Product) => {
    onProductSelect(product);
    setSearchCode("");
    setIsOpen(false);
  };

  const handleCodeSubmit = async () => {
    if (!searchCode.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/products/search?query=${searchCode}`);
      if (response.ok) {
        const searchResults = await response.json();
        if (searchResults.length > 0) {
          const product = {
            id: searchResults[0].product_code,
            code: searchResults[0].product_code,
            name: searchResults[0].name,
            quantity: searchResults[0].quantity,
            unit: "units",
          };
          handleProductSelect(product);
        } else {
          alert("Product not found");
        }
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product by code:", error);
      alert("Error fetching product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1">
              <Input
                value={searchCode}
                onChange={(e) => {
                  setSearchCode(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            {filteredProducts.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: {product.code} | Stock: {product.quantity}{" "}
                      {product.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchCode && filteredProducts.length === 0 && (
              <div className="p-3 text-center text-muted-foreground">
                No products found
              </div>
            )}
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleCodeSubmit}
          disabled={!searchCode.trim() || loading}
          variant="outline"
        >
          {loading ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}
