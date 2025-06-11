// File Path: src/app/dashboard/products/page.tsx
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
// import productsData from "@/data/products.json"; // Removed static data import
import { getSellerProducts, deleteProduct } from "../../../../services/productService"; // Adjusted path
import { useRouter } from "next/navigation";

// Define Product type based on backend schema
interface Product {
  id: string; // This is the custom string ID from our schema
  general: {
    title: string;
    images: string[];
    category?: string; // Optional as it's not used in current table
    description?: string; // Optional
  };
  inventory: {
    sku: string;
    quantity: number;
  };
  pricing: {
    price: number;
  };
  // Add other fields if needed by the table or actions
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  const [products, setProducts] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getSellerProducts();
        // Transform data to fit the DataTable structure if needed
        // Assuming the data from getSellerProducts matches the new Product interface
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Handle error (e.g., show a toast message)
      }
    };
    fetchProducts();
  }, []);

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      // Add success toast/notification here
    } catch (error) {
      console.error("Failed to delete product:", error);
      // Add error toast/notification here
      setIsDeleteDialogOpen(false); // Optionally close dialog on error too
    }
  };

  // Define columns for DataTable, mapping to the new Product structure
  const productColumns = [
    {
      header: "Image",
      accessorKey: "general.images", // Adjusted accessor
      className: "w-[80px]",
      cell: ({ row }) => {
        const product = row.original as Product;
        const imageUrl = product.general.images && product.general.images.length > 0
          ? `${API_BASE_URL}${product.general.images[0]}`
          : "/placeholder-image.png"; // Fallback image
        return (
          <img
            src={imageUrl}
            alt={product.general.title}
            className="h-16 w-16 object-cover rounded-md bg-gray-100"
          />
        );
      },
    },
    { header: "Name", accessorKey: "general.title" }, // Adjusted accessor
    { header: "SKU", accessorKey: "inventory.sku" }, // Adjusted accessor
    { header: "Price", accessorKey: "pricing.price", cell: ({ row }) => {
        const product = row.original as Product;
        return `$${product.pricing.price}`;
      }
    },
    { header: "Stock", accessorKey: "inventory.quantity" }, // Adjusted accessor
    {
      header: "Status",
      accessorKey: "inventory.quantity", // Status is derived from quantity
      cell: ({ row }) => {
        const product = row.original as Product;
        return <StatusBadge quantity={product.inventory.quantity} />;
      }
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
        // className: "text-red-600",
      },
    ];
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/dashboard-seller/products/add" passHref> {/* Corrected path */}
          <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by name or SKU"
            className="pl-10 bg-white h-12"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
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

      {/* Reusable Data Table */}
      <DataTable
        columns={productColumns}
        data={products}
        getActions={getProductActions}
      />

      {/* Delete Confirmation Dialog */}
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
              <p className="font-semibold mt-2">{selectedProduct?.general?.title}</p> {/* Adjusted field */}
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
