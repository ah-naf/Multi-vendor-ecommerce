import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import { User } from "@/context/AuthContext";
import ProductDetails from "./_productDetails";
import { getApiBaseUrl } from "@/services/productService";

interface PopulatedSeller
  extends Omit<
    User,
    "_id" | "password" | "addresses" | "cart" | "wishlist" | "roles"
  > {
  // Include fields we expect from backend populate: 'firstName lastName email phone'
  // Adjust if your User type in `frontend/src/types/index.ts` is different
}

interface ProductWithPopulatedSeller extends Omit<Product, "seller"> {
  seller: PopulatedSeller | null; // Seller can be null if not populated or not found
}

export async function generateMetadata({
  params,
}: {
  // params now comes in as a promise of your route params
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // await params before using its properties
  const { id } = await params;

  const res = await fetch(`${getApiBaseUrl()}/customer/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { title: "Product not found", description: "No product data." };
  }

  const data: ProductWithPopulatedSeller = await res.json();
  return {
    title: data.general.title,
    description: data.general.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const res = await fetch(`${getApiBaseUrl()}/customer/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to fetch product data");

  const product: ProductWithPopulatedSeller = await res.json();
  return <ProductDetails product={product} />;
}
