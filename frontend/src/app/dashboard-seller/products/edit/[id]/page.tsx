"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSellerProductById, updateProduct } from "@/services/productService";
import { Product } from "@/types";
import { ProductForm } from "@/components/ProductForm";
import { toast } from "sonner"; // Import toast

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const data = await getSellerProductById(id);
          setProduct(data);
          setError(null);
        } catch (err) {
          const fetchError = err instanceof Error ? err.message : "Failed to load product data.";
          console.error("Failed to fetch product:", fetchError);
          setError(fetchError);
          toast.error(`Error fetching product: ${fetchError}`);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      const idError = "Invalid product ID.";
      setError(idError);
      toast.error(idError);
      setLoading(false);
    }
  }, [id]); // Removed router from dependencies as it's not directly used for re-fetching logic here

  const handleSubmit = async (formData: FormData) => {
    if (!id || typeof id !== "string") {
      const idMissingError = "Product ID is missing, cannot update.";
      setError(idMissingError);
      toast.error(idMissingError);
      return;
    }
    try {
      const updatedProduct = await updateProduct(id, formData);
      toast.success("Product updated successfully!");
      console.log("Product updated successfully:", updatedProduct);
      router.push("/dashboard-seller/products"); // Navigate to product list on success
    } catch (err) {
      const updateError = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Failed to update product:", updateError);
      setError(updateError);
      toast.error(`Failed to update product: ${updateError}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading product details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Product</h1>
        <ProductForm
          onSubmit={handleSubmit}
          initialData={product} // Pass the fetched product data
          mode="edit" // Explicitly set mode
        />
      </div>
    </div>
  );
};

export default EditProductPage;
