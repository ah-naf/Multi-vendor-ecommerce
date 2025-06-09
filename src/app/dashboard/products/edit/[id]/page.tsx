// src/app/dashboard/products/edit/[id]/page.tsx
"use client";

import { ProductForm } from "@/components/ProductForm";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import productsData from "@/data/products.json"; // Import the JSON data

export default function AddOrEditProductPage({
  params,
}: {
  params: { id?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = !!params.id;
  const [productToEdit, setProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      // Find the product in our "database"
      const product = productsData.find((p) => p.id === params.id);
      setProductToEdit(product);
      setIsLoading(false);
    }
  }, [isEditMode, params.id]);

  const handleSave = (data) => {
    if (isEditMode) {
      console.log("UPDATING product:", params.id, data);
      alert("Product updated! Check the console for data.");
    } else {
      console.log("ADDING new product:", data);
      alert("Product added! Check the console for data.");
    }
    // In a real app, you would send this data to your API
    // then invalidate the product list cache to show the new data.
    router.push("/dashboard/products");
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  if (isLoading) {
    return <div>Loading product data...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm
        initialProduct={productToEdit}
        isEditMode={isEditMode}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
