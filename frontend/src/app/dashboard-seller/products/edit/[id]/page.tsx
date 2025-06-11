"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import productsData from "@/data/products.json";
import { ProductForm } from "@/components/ProductForm";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [productToEdit, setProductToEdit] = useState<any>(null);

  useEffect(() => {
    const found = productsData.find((p) => p.id === id);
    if (found) {
      setProductToEdit(found);
    } else {
      // If invalid ID, go back to list
      router.push("/dashboard/products");
    }
  }, [id]);

  const handleSave = (updated: any) => {
    // In a real app you'd POST/PATCH to your API here.
    console.log("Updating product:", id, updated);
    router.push("/dashboard/products");
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  if (!productToEdit) {
    return (
      <div className="p-8 text-center text-gray-600">Loading product data…</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow">
      <ProductForm
        initialProduct={productToEdit}
        isEditMode={true}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
