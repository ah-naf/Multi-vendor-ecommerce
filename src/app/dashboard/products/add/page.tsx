// File Path: src/app/dashboard/products/add/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProductForm } from "../../../../components/ProductForm";
import productsData from "../../../../data/products.json";
import { useRouter } from "next/navigation";

export default function AddOrEditProductPage({
  params,
}: {
  params: { id?: string };
}) {
  const isEditMode = !!params.id;
  const [productToEdit, setProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const router = useRouter();

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
    // In a real app, you would use the Next.js router to navigate.
    // router.push('/dashboard/products');
    console.log("Redirecting to /dashboard/products ...");
  };

  const handleCancel = () => {
    // In a real app, you would use the Next.js router to navigate.
    // router.push('/dashboard/products');
    console.log("Cancelling and redirecting to /dashboard/products ...");
    router.push("/dashboard/products");
  };

  if (isEditMode && isLoading) {
    return <div className="p-8">Loading product data...</div>;
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
