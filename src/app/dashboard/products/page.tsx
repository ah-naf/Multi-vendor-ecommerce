// File Path: src/app/dashboard/products/page.tsx
"use client";

import React, { useState } from "react";
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
import { Search, ChevronDown, PlusCircle, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/DataTable";

// --- MOCK DATA ---

const initialProducts = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    sku: "TS-001",
    price: 100,
    stock: 200,


    
    status: "Active",
    category: "Men's Clothing",
    image: "https://placehold.co/128x128/e2e8f0/e2e8f0",
  },
  {
    id: 2,
    name: "Leather Wallet",
    sku: "WL-002",
    price: 50,
    stock: 20,
    status: "Active",
    category: "Accessories",
    image: "https://placehold.co/128x128/e2e8f0/e2e8f0",
  },
  {
    id: 3,
    name: "Wireless Earbuds",
    sku: "EB-003",
    price: 70,
    stock: 12,
    status: "Low Stock",
    category: "Electronics",
    image: "https://placehold.co/128x128/e2e8f0/e2e8f0",
  },
  {
    id: 4,
    name: "Handcrafted Ceramic Mug",
    sku: "MG-004",
    price: 60,
    stock: 32,
    status: "Active",
    category: "Kitchen & Dining",
    image: "https://placehold.co/128x128/e2e8f0/e2e8f0",
  },
  {
    id: 5,
    name: "Organic Face Cream",
    sku: "FC-005",
    price: 200,
    stock: 0,
    status: "Out of Stock",
    category: "Skincare",
    image: "https://placehold.co/128x128/e2e8f0/e2e8f0",
  },
  {
    id: 6,
    name: "Bamboo Cutting Board",
    sku: "CB-006",
    price: 20,
    stock: 5,
    status: "Low Stock",
    category: "Kitchen & Dining",
    image: "https://placehold.co/128x128/e2e8f0/e2e8f0",
  },
];

const StatusBadge = ({ status }) => {
  const variant =
    {
      Active: "default",
      "Low Stock": "secondary",
      "Out of Stock": "destructive",
    }[status] || "default";
  return <Badge variant={variant}>{status}</Badge>;
};

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (product) => {
    // In a real app, this would open an edit form/modal
    console.log("Editing product:", product);
    alert(`Editing: ${product.name}`);
  };

  const confirmDelete = () => {
    setProducts(products.filter((p) => p.id !== selectedProduct.id));
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const productColumns = [
    {
      header: "Image",
      accessor: "image",
      className: "w-[80px]",
      cell: (row, view) => (
        <img
          src={row.image}
          alt={row.name}
          className={`${
            view === "mobile" ? "h-16 w-16" : "h-12 w-12"
          } object-cover rounded-md bg-gray-100`}
        />
      ),
    },
    { header: "Name", accessor: "name" },
    { header: "SKU", accessor: "sku" },
    {
      header: "Price",
      accessor: "price",
      cell: (row) => `$${row.price.toFixed(2)}`,
    },
    { header: "Stock", accessor: "stock" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search by name or SKU" className="pl-10" />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-40 justify-between"
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
              <DropdownMenuCheckboxItem>Electronics</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                Men's Clothing
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Skincare</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-40 justify-between"
              >
                Stock Status <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Stock</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>All</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Active</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Low Stock</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Out of Stock</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reusable Data Table */}
      <DataTable
        columns={productColumns}
        data={products}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
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
              <p className="font-semibold mt-2">{selectedProduct?.name}</p>
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
