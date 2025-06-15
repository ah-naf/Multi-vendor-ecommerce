"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronDown,
  PlusCircle,
  AlertTriangle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Action, DataTable } from "@/components/DataTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProduct, getSellerProducts } from "@/services/productService";
import { toast } from "sonner";
import { Product } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const StatusBadge = ({ quantity }: { quantity: number }) => {
  let status = "Active";
  let variant: "default" | "secondary" | "destructive" = "default";
  if (quantity === 0) {
    status = "Out of Stock";
    variant = "destructive";
  } else if (quantity < 20) {
    status = "Low Stock";
    variant = "secondary";
  }
  return <Badge variant={variant}>{status}</Badge>;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSellerProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to load products: ${msg}`);
      toast.error(`Failed to load products: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredProducts(products);
      return;
    }
    const result = products.filter((p) => {
      return (
        p.general.title.toLowerCase().includes(term) ||
        p.inventory.sku.toLowerCase().includes(term)
      );
    });
    setFilteredProducts(result);
    if (result.length === 0) {
      toast.info(`No products found matching “${searchTerm}.”`);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredProducts(products);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast.success("Product deleted successfully.");
      fetchProducts();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product.");
      setIsDeleteDialogOpen(false);
    }
  };

  const productColumns = [
    {
      header: "ID",
      className: "w-[60px] text-sm font-mono",
      cell: (product: Product) => product.id,
    },
    {
      header: "Image",
      className: "w-[80px]",
      cell: (product: Product) => {
        const imageUrl =
          product.general.images?.length > 0
            ? `${API_BASE_URL}${product.general.images[0]}`
            : "/placeholder-image.png";
        return (
          <img
            src={imageUrl}
            alt={product.general.title}
            className="h-16 w-16 object-cover rounded-md bg-gray-100"
          />
        );
      },
    },
    {
      header: "Name",
      cell: (product: Product) => product.general.title,
    },
    {
      header: "SKU",
      cell: (product: Product) => product.inventory.sku,
    },
    {
      header: "Price",
      cell: (product: Product) => `$${product.pricing.price}`,
    },
    {
      header: "Sale Price",
      cell: (product: Product) => `$${product.pricing.salePrice}`,
    },
    {
      header: "Stock",
      cell: (product: Product) => product.inventory.quantity,
    },
    {
      header: "Status",
      cell: (product: Product) => (
        <StatusBadge quantity={product.inventory.quantity} />
      ),
    },
  ];

  const getProductActions = (row: Product): Action<Product>[] => {
    return [
      {
        label: "Edit",
        icon: <Pencil className="mr-1 h-4 w-4" />,
        onClick: () => router.push(`/dashboard-seller/products/edit/${row.id}`), // Corrected path
        variant: "outline",
      },
      {
        label: "Delete",
        icon: <Trash2 className="mr-1 h-4 w-4" />,
        onClick: () => handleDeleteClick(row),
        variant: "destructive",
      },
    ];
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/dashboard-seller/products/add" passHref>
          {" "}
          <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
        {" "}
        <div className="relative flex-grow">
          {" "}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name or SKU..."
            className="pl-10 bg-white h-12 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <Button
          onClick={handleSearch}
          className="h-12 bg-red-500 hover:bg-red-600 text-white px-6 shrink-0"
        >
          {" "}
          Search
        </Button>
        {searchTerm && (
          <Button
            variant="outline"
            onClick={clearSearch}
            className="h-12 px-6 shrink-0"
          >
            Clear
          </Button>
        )}
        <div className="flex gap-4 w-full md:w-auto shrink-0">
          {" "}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-40 justify-between h-12"
              >
                Category <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>
                All Categories
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-40 justify-between h-12"
              >
                Stock Status <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Stock</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>All</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <DataTable
          columns={productColumns}
          data={filteredProducts}
          getActions={getProductActions}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center mt-4">
              Delete Product?
            </DialogTitle>
            <DialogDescription className="text-center px-4">
              Are you sure you want to delete this product? This action cannot
              be undone.
              <p className="font-semibold mt-2">
                {selectedProduct?.general?.title}
              </p>{" "}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
