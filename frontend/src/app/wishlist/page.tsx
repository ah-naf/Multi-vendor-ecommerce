"use client";

import React, { useEffect, useState } from "react"; // Added useState, useEffect
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { HeartCrack, XCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product, WishlistItem } from "@/types"; // Added Product type
import { getApiBaseUrl, getBackendBaseUrl } from "@/services/productService";

export default function WishlistPage() {
  const {
    wishlistItems,
    removeFromWishlist,
    getWishlistTotalItems,
    isLoading: isWishlistLoading,
  } = useWishlist();
  const { addToCart, cartItems, isLoading: isCartLoading } = useCart();

  const [detailedWishlistProducts, setDetailedWishlistProducts] = useState<
    Product[]
  >([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const totalItems = getWishlistTotalItems();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (wishlistItems.length === 0) {
        setDetailedWishlistProducts([]);
        return;
      }

      setIsFetchingDetails(true);
      const productsDetails: Product[] = [];
      try {
        for (const item of wishlistItems) {
          const response = await fetch(
            `${getApiBaseUrl()}/customer/products/${item.productId}`
          );
          if (!response.ok) {
            throw new Error(
              `Failed to fetch details for product ${item.productId}`
            );
          }
          const productData = await response.json();
          productsDetails.push(productData);
        }
        setDetailedWishlistProducts(productsDetails);
      } catch (error: any) {
        console.error("Error fetching product details for wishlist:", error);
        toast.error(
          "Some wishlist item details could not be loaded. Please try again."
        );
        // Optionally, set only successfully fetched items or an empty array
        // setDetailedWishlistProducts([]);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    fetchProductDetails();
  }, [wishlistItems]);

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
    } catch (error: any) {
      toast.error(
        `Failed to move ${product.general.title} to cart: ${error.message}`
      );
    }
  };

  const isLoading = isWishlistLoading || isFetchingDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          {!isLoading && (
            <span className="text-lg text-gray-700">
              {detailedWishlistProducts.length} item
              {detailedWishlistProducts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-xl text-gray-700 mt-4">
              Loading wishlist details...
            </p>
          </div>
        )}

        {!isLoading && detailedWishlistProducts.length === 0 && (
          <div className="text-center py-12">
            <HeartCrack className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-700 mb-2">
              Your wishlist is empty or items could not be loaded.
            </p>
            <p className="text-gray-500 mb-6">
              Explore products and add your favorites to your wishlist!
            </p>
            <Link href="/" passHref>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Discover Products
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && detailedWishlistProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {detailedWishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl flex flex-col"
              >
                <Link href={`/products/${product.id}`} passHref>
                  <div className="relative w-full h-60 bg-gray-100">
                    <Image
                      src={
                        product.general.images?.[0]
                          ? `${getBackendBaseUrl()}${
                              product.general.images[0]
                            }`
                          : "/placeholder-image.svg"
                      }
                      alt={product.general.title}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                    {product.general.category}
                  </p>
                  <h3
                    className="text-lg font-semibold text-gray-800 mb-2 truncate flex-grow"
                    title={product.general.title}
                  >
                    <Link
                      href={`/products/${product.id}`}
                      passHref
                      className="hover:text-red-600 transition-colors"
                    >
                      {product.general.title}
                    </Link>
                  </h3>

                  <div className="flex items-center justify-between mt-2 mb-1">
                    <p className="text-xl font-bold text-red-600">
                      ${product.pricing.price.toFixed(2)}
                    </p>
                    {product.pricing.enableNegotiation && (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Negotiable
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-3 space-y-0.5">
                    <p>SKU: {product.inventory.sku}</p>
                    <p>Stock: {product.inventory.quantity}</p>
                  </div>

                  <div className="mt-auto flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                      onClick={() => handleMoveToCart(product)}
                      disabled={isCartLoading || isWishlistLoading || isFetchingDetails}
                    >
                      <ShoppingCart className="h-5 w-5" /> Move to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                      onClick={() => removeFromWishlist(product.id)}
                      disabled={isWishlistLoading || isFetchingDetails}
                    >
                      <XCircle className="h-5 w-5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
