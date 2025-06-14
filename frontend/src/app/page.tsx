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
import { Product, ApiError } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { getApiBaseUrl } from "@/services/productService";
import axios, { AxiosError } from "axios";
import { useCart } from "@/context/CartContext";

// --- MAIN HOMEPAGE COMPONENT ---
export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
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
        const response = await fetch(`${getApiBaseUrl()}/customer/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Failed to fetch products:", errorMessage);
        setError("Failed to fetch products. Please try again later.");
        toast.error("Failed to fetch products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      // Only fetch products if user is logged in
      fetchProducts();
    }
  }, [user]); // Re-fetch if user changes (e.g., logs out and logs in as different user)

  const { addToCart, cartItems, isLoading: isCartLoading } = useCart();

  const handleMoveToCart = async (product: Product) => {
    // Using Product type now
    const itemForCart = {
      productId: product.id,
      name: product.general.title,
      price: product.pricing.price,
      image:
        product.general.images && product.general.images.length > 0
          ? product.general.images[0]
          : undefined,
      // Assuming CartItem might expect a simplified category or specific attributes.
      // For now, let's pass general category. Adjust if CartContext's addToCart needs more/less.
      category: product.general.category,
      // attributes: product.attributes, // If you have a structured way to pass attributes
    };

    const itemInCart = cartItems.find(
      (cartItem) => cartItem.productId === product.id
    );

    if (itemInCart) {
      toast.info(
        `${product.general.title} is already in your cart. You can update quantity there.`
      );
      return;
    }

    try {
      await addToCart(itemForCart, 1);
      await removeFromWishlist(product.id); // product.id is the productId
      toast.success(`${product.general.title} moved to cart!`);
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";
      if (axios.isAxiosError(error)) {
        // If the error originates from an axios call in a service
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String((error as { message: unknown }).message);
      }
      toast.error(
        `Failed to move ${product.general.title} to cart: ${errorMessage}`
      );
    }
  };

  if (authLoading || (!user && !authLoading)) {
    // Show loading if auth is loading or if user is not yet determined (and not loading)
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
          <div className="text-center text-xl text-gray-700">
            Loading products...
          </div>
        )}
        {error && (
          <div className="text-center text-xl text-red-600 bg-red-100 p-4 rounded-md">
            Error: {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center text-xl text-gray-700">
            No products found.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
              const isProductWishlisted = isWishlisted(product.id);

              const isSellerProduct = !!(
                product.seller &&
                user &&
                product.seller === user._id
              );

              const handleWishlistToggle = () => {
                if (isProductWishlisted) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist({
                    productId: product.id,
                    name: product.general.title,
                    price: product.pricing.price,
                    image:
                      product.general.images &&
                      product.general.images.length > 0
                        ? product.general.images[0]
                        : undefined,
                    category: product.general.category,
                  });
                }
              };

              return (
                <Card
                  key={product.id || product._id}
                  className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <Link href={`/products/${product.id}`} passHref>
                    <div className="overflow-hidden">
                      <img
                        src={
                          product.general.images?.[0]
                            ? `${
                                process.env.NEXT_PUBLIC_API_BASE_URL ||
                                "http://localhost:5000"
                              }${product.general.images[0]}`
                            : "/placeholder-image.svg"
                        }
                        alt={product.general.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      />
                    </div>
                  </Link>

                  <CardContent className="p-4 bg-white">
                    {/* Category */}
                    <p className="text-sm text-gray-500 mb-1">
                      {product.general.category}
                    </p>

                    {/* Title */}
                    <h3
                      className="font-semibold text-lg text-gray-800 h-14 truncate"
                      title={product.general.title}
                    >
                      {product.general.title}
                    </h3>

                    {/* Price & Negotiable Badge */}
                    <div className="flex items-center justify-between mt-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        ${product.pricing.price.toFixed(2)}
                      </span>
                      {product.pricing.enableNegotiation && (
                        <span className="text-sm font-medium text-green-600">
                          Negotiable
                        </span>
                      )}
                    </div>

                    {/* SKU & Stock */}
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">SKU:</span>{" "}
                        {product.inventory.sku}
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span>{" "}
                        {product.inventory.quantity}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`border-gray-300 hover:bg-red-50 ${
                          isWishlisted(product.id)
                            ? "text-red-600 border-red-400"
                            : "text-gray-600 hover:text-red-600"
                        }`}
                        onClick={() => handleWishlistToggle()}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isWishlisted(product.id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                      <Button
                        className="flex-grow bg-red-500 text-white hover:bg-red-500/90"
                        onClick={() => handleMoveToCart(product)}
                        disabled={isSellerProduct}
                      >
                        {isSellerProduct ? (
                          "Own Product"
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to
                            Cart
                          </>
                        )}
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
