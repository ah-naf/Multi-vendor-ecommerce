"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/services/productService";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner";

const AddProductPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      const newProduct = await createProduct(formData);
      toast.success("Product added successfully!");
      console.log("Product created successfully:", newProduct);
      router.push("/dashboard-seller/products");
    } catch (err) {
      const createError =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Failed to create product:", createError);
      toast.error(`Failed to add product: ${createError}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Add New Product</h1>
        <ProductForm onSubmit={handleSubmit} mode="create" />
      </div>
    </div>
  );
};

export default AddProductPage;
