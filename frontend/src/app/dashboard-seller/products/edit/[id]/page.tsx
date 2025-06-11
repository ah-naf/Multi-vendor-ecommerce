"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
// Assuming ProductForm is in frontend/src/components/ProductForm.tsx
import ProductForm, { ProductFormData } from "../../../../../../components/ProductForm";
// Assuming productService is in frontend/src/services/productService.ts
import { getSellerProductById, updateProduct } from "../../../../../../services/productService";
import { Product } from "../../../../../../types"; // Assuming a global Product type exists or will be created

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const data = await getSellerProductById(id);
          setProduct(data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch product:", err);
          setError(err.message || "Failed to load product data.");
          // Optionally redirect if product not found or not authorized
          // router.push("/dashboard-seller/products");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setError("Invalid product ID.");
      setLoading(false);
    }
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    if (!id || typeof id !== 'string') {
      setError("Product ID is missing, cannot update.");
      return;
    }
    try {
      // Optional: Log FormData entries for debugging
      // for (let [key, value] of formData.entries()) {
      //   console.log(`FormData Update ${key}: ${value instanceof File ? value.name : value}`);
      // }

      const updatedProduct = await updateProduct(id, formData);
      console.log("Product updated successfully:", updatedProduct);
      // TODO: Add success toast/notification here
      router.push("/dashboard-seller/products"); // Navigate to product list on success
    } catch (error) {
      console.error("Failed to update product:", error);
      setError(error.message || "Failed to update product.");
      // TODO: Add error toast/notification here, possibly in the form
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
