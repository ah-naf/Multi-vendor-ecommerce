"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/services/productService";
import { ProductForm } from "@/components/ProductForm";
// Assuming productService is in frontend/src/services/productService.ts

const AddProductPage = () => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      // Optional: Log FormData entries for debugging
      // for (let [key, value] of formData.entries()) {
      //   console.log(`FormData ${key}: ${value instanceof File ? value.name : value}`);
      // }

      const newProduct = await createProduct(formData);
      console.log("Product created successfully:", newProduct);
      // TODO: Add success toast/notification here
      router.push("/dashboard-seller/products"); // Navigate to product list on success
    } catch (error) {
      console.error("Failed to create product:", error);
      // TODO: Add error toast/notification here
      // Consider displaying error.message to the user in the form
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Add New Product</h1>
        <ProductForm
          onSubmit={handleSubmit}
          mode="create" // Explicitly set mode for clarity in ProductForm
        />
      </div>
    </div>
  );
};

export default AddProductPage;
