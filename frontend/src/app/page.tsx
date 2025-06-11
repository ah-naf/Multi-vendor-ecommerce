"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Product } from "@/types"; // Import Product type
import { useWishlist } from "@/context/WishlistContext"; // Import useWishlist

// --- MAIN HOMEPAGE COMPONENT ---
export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auth check redirection
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      }
      // If user exists, role-based redirection is handled by useAuth or another effect if needed
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/customer/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Failed to fetch products:", errorMessage);
        setError("Failed to fetch products. Please try again later.");
        toast.error("Failed to fetch products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Only fetch products if user is logged in
      fetchProducts();
    }
  }, [user]); // Re-fetch if user changes (e.g., logs out and logs in as different user)

  if (authLoading || (!user && !authLoading)) { // Show loading if auth is loading or if user is not yet determined (and not loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading authentication...</div>
      </div>
    );
  }

  // If user is null and auth is done loading, they would have been redirected.
  // So, if we reach here and user is null, it's an unexpected state or brief moment before redirect.
  // However, the primary loading for products screen is handled below.

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Products For You
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
            Discover our curated selection of high-quality electronics.
          </p>
        </div>

        {loading && (
          <div className="text-center text-xl text-gray-700">Loading products...</div>
        )}
        {error && (
          <div className="text-center text-xl text-red-600 bg-red-100 p-4 rounded-md">
            Error: {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center text-xl text-gray-700">No products found.</div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const isProductWishlisted = isWishlisted(product.id);

              const handleWishlistToggle = () => {
                if (isProductWishlisted) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist({
                    id: product.id,
                    _id: product._id,
                    name: product.general.title,
                    price: product.pricing.price, // You might want to use salePrice if available
                    image: product.general.images && product.general.images.length > 0 ? product.general.images[0] : undefined,
                    category: product.general.category,
                  });
                }
              };

              return (
                <Card
                  key={product.id || product._id} // Use custom ID first, fallback to _id
                  className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <Link href={`/products/${product.id}`} passHref>
                    <div className="overflow-hidden">
                      <img
                        src={product.general.images && product.general.images.length > 0 ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${product.general.images[0]}` : "/placeholder-image.svg"}
                        alt={product.general.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      />
                    </div>
                  </Link>

                  <CardContent className="p-4 bg-white">
                    <p className="text-sm text-gray-500 mb-1">{product.general.category}</p>
                    <h3
                      className="font-semibold text-lg text-gray-800 h-14 truncate"
                      title={product.general.title}
                    >
                      {product.general.title}
                    </h3>
                    <p className="text-xl font-bold text-gray-900 mt-2 mb-4">
                      ${product.pricing.price.toFixed(2)}
                    </p>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`border-gray-300 hover:bg-red-50 ${
                          isProductWishlisted ? "text-red-600 border-red-400" : "text-gray-600 hover:text-red-600"
                        }`}
                        onClick={handleWishlistToggle}
                      >
                        <Heart className={`h-5 w-5 ${isProductWishlisted ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        className="flex-grow bg-red-500 text-white hover:bg-red-500/90"
                        onClick={() => toast.info(`${product.general.title} added to cart (mocked from homepage)!`)}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
