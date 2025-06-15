import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "./_productDetails";
import { getApiBaseUrl } from "@/services/productService";
import { ProductWithPopulatedSeller } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const res = await fetch(`${getApiBaseUrl()}/customer/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to fetch product data");

  const product: ProductWithPopulatedSeller = await res.json();
  return <ProductDetails product={product} />;
}
