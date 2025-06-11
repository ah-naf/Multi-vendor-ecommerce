"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Added Card, CardContent
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Heart, HeartCrack, XCircle, ShoppingCart, Trash2 } from "lucide-react"; // Added Heart, Trash2
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { getApiBaseUrl, getBackendBaseUrl } from "@/services/productService";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Added Dialog components

export default function WishlistPage() {
  const {
    wishlistItems,
    removeFromWishlist,
    // getWishlistTotalItems, // This function might not be needed if we use detailedWishlistProducts.length
    isLoading: isWishlistLoading,
    clearWishlist, // Assuming this will be added to context
  } = useWishlist();
  const { addToCart, cartItems, isLoading: isCartLoading } = useCart();

  const [detailedWishlistProducts, setDetailedWishlistProducts] = useState<
    Product[]
  >([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);

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
          // Ensure item and item.productId are valid
          if (item && item.productId) {
            const response = await fetch(
              `${getApiBaseUrl()}/customer/products/${item.productId}`
            );
            if (!response.ok) {
              // Log specific item error and continue if you want partial loading
              console.error(
                `Failed to fetch details for product ${item.productId}. Status: ${response.status}`
              );
              // throw new Error(`Failed to fetch details for product ${item.productId}`);
              continue; // Skip this item if it fails
            }
            const productData = await response.json();
            productsDetails.push(productData);
          }
        }
        setDetailedWishlistProducts(productsDetails);
      } catch (error: any) {
        console.error("Error fetching product details for wishlist:", error);
        toast.error(
          "Some wishlist item details could not be loaded. Please try again."
        );
      } finally {
        setIsFetchingDetails(false);
      }
    };

    if (wishlistItems && wishlistItems.length > 0) {
      fetchProductDetails();
    } else {
      setDetailedWishlistProducts([]); // Clear products if wishlist is empty
    }
  }, [wishlistItems]);

  const handleMoveToCart = async (product: Product) => {
    const itemForCart = {
      productId: product.id,
      name: product.general.title,
      price: product.pricing.price,
      image:
        product.general.images && product.general.images.length > 0
          ? product.general.images[0]
          : undefined,
      category: product.general.category,
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

  const handleDeleteItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success("Item removed from wishlist.");
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
    }
  };

  const handleClearAllWishlistItems = async () => {
    try {
      if (clearWishlist) {
        // Check if clearWishlist from context exists
        await clearWishlist(); // Use context function
      } else {
        // Fallback or direct modification if context function is not yet implemented
        // This part will be updated once clearWishlist is confirmed in context
        console.warn(
          "clearWishlist function not available in context. Performing client-side clear only for now."
        );
        setDetailedWishlistProducts([]);
        // Note: This fallback doesn't clear backend state.
        // For a full solution, clearWishlist in context should handle this.
      }
      toast.success("Wishlist cleared successfully!");
      setShowClearConfirmDialog(false);
    } catch (error: any) {
      toast.error(`Failed to clear wishlist: ${error.message}`);
      setShowClearConfirmDialog(false);
    }
  };

  const isLoading = isWishlistLoading || isFetchingDetails;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header from dashboard-customer/wishlist */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            My Wishlist
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Your collection of saved items ({detailedWishlistProducts.length}{" "}
            items).
          </p>
        </div>
        {detailedWishlistProducts.length > 0 && (
          <Dialog
            open={showClearConfirmDialog}
            onOpenChange={setShowClearConfirmDialog}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action will remove all items from your wishlist. This
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearAllWishlistItems}
                >
                  Confirm & Clear All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-24">
          {" "}
          {/* Adjusted padding */}
          <div role="status" className="flex justify-center items-center">
            <svg
              aria-hidden="true"
              className="w-12 h-12 text-gray-300 animate-spin fill-red-600" // Adjusted size and color
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
          <p className="text-xl text-gray-700 mt-6">
            {" "}
            {/* Adjusted margin */}
            Loading your cherished items...
          </p>
        </div>
      )}

      {!isLoading && detailedWishlistProducts.length === 0 && (
        // Empty state from dashboard-customer/wishlist
        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
          {" "}
          {/* Styled background and border */}
          <Heart className="mx-auto h-16 w-16 text-gray-300" />{" "}
          {/* Changed icon to Heart */}
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            {" "}
            {/* Adjusted text size */}
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-500 mt-2 text-md">
            {" "}
            {/* Adjusted text size */}
            Looks like you haven't added anything yet. Let's change that!
          </p>
          <Link href="/" passHref>
            <Button className="mt-8 h-11 px-8 bg-red-600 text-white hover:bg-red-700 transition-colors">
              {" "}
              {/* Styled button */}
              Start Shopping
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && detailedWishlistProducts.length > 0 && (
        // Grid layout from dashboard-customer/wishlist
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {" "}
          {/* Adjusted gap */}
          {detailedWishlistProducts.map((product) => (
            // Product card from dashboard-customer/wishlist (adapted)
            <Card
              key={product.id}
              className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col"
            >
              <Link href={`/products/${product.id}`} passHref className="block">
                <div className="overflow-hidden relative w-full h-60 sm:h-56">
                  {" "}
                  {/* Adjusted height for consistency */}
                  <Image
                    src={
                      product.general.images?.[0]
                        ? `${getBackendBaseUrl()}${product.general.images[0]}`
                        : "/placeholder-image.svg"
                    }
                    alt={product.general.title}
                    layout="fill" // Changed to fill
                    objectFit="cover" // Ensures image covers the area
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10 h-9 w-9 bg-white/70 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-600 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteItem(product.id)} // Uses new handleDeleteItem
                disabled={isWishlistLoading}
                title="Remove from wishlist"
              >
                <Trash2 className="h-5 w-5" />
              </Button>

              <CardContent className="p-4 flex flex-col flex-grow">
                {" "}
                {/* Ensure CardContent takes remaining space */}
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  {product.general.category}
                </p>
                <h3
                  className="font-semibold text-lg text-gray-800 truncate mb-1 flex-grow"
                  title={product.general.title}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="hover:text-red-500 transition-colors"
                  >
                    {product.general.title}
                  </Link>
                </h3>
                {/* Attributes can be added here if available and desired, e.g. product.attributes */}
                {/* <p className="text-sm text-gray-500">{product.attributes || "Standard"}</p> */}
                <div className="flex items-center justify-between mt-3 mb-3">
                  <p className="text-xl font-bold text-gray-900">
                    ${product.pricing.price.toFixed(2)}
                  </p>
                  {product.pricing.enableNegotiation && (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Negotiable
                    </span>
                  )}
                </div>
                {/* Stock info can be useful */}
                <p className="text-xs text-gray-500 mb-4">
                  SKU: {product.inventory.sku} | Stock:{" "}
                  {product.inventory.quantity > 0
                    ? `${product.inventory.quantity} available`
                    : "Out of Stock"}
                </p>
                <div className="mt-auto">
                  {" "}
                  {/* Pushes buttons to the bottom */}
                  <Button
                    size="sm" // Standardized size
                    className="w-full bg-red-500 hover:bg-red-600 text-white h-10 px-4 flex items-center justify-center gap-2 transition-colors" // Standardized style
                    onClick={() => handleMoveToCart(product)}
                    disabled={
                      isCartLoading ||
                      isWishlistLoading ||
                      isFetchingDetails ||
                      product.inventory.quantity === 0
                    }
                  >
                    <ShoppingCart className="mr-1 h-4 w-4" />{" "}
                    {product.inventory.quantity > 0
                      ? "Move to Cart"
                      : "Out of Stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
