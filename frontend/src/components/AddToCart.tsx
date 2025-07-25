"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface AddToCartProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
  productImage: string;
  maxQty: number;
  selectedQuantity: number;
  isOwnProduct?: boolean;
}

export function AddToCart({
  productId,
  productTitle,
  currentPrice,
  productImage,
  maxQty,
  selectedQuantity,
  isOwnProduct,
}: AddToCartProps) {
  const { addToCart, cartItems } = useCart();

  if (isOwnProduct) {
    return (
      <Button
        className="bg-gray-400 hover:bg-gray-400 text-white px-8 py-3 h-12 w-full rounded-xl text-base font-semibold flex items-center justify-center gap-2"
        disabled
      >
        You cannot buy your own product
      </Button>
    );
  }

  const handleAddToCart = () => {
    if (maxQty === 0) {
      toast.error("This product is out of stock.");
      return;
    }

    if (selectedQuantity <= 0) {
      toast.error("Please select a valid quantity.");
      return;
    }

    if (selectedQuantity > maxQty) {
      toast.error(`Only ${maxQty} items available in stock.`);
      return;
    }

    const itemInCart = cartItems.find((item) => item.productId === productId);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQuantityInCart + selectedQuantity > maxQty) {
      toast.error(
        `Cannot add ${selectedQuantity} item(s). You already have ${currentQuantityInCart} in cart, and only ${maxQty} are in stock.`
      );
      return;
    }

    addToCart(
      {
        productId: productId,
        name: productTitle,
        price: currentPrice,
        image: productImage,
      },
      selectedQuantity
    );
    toast.success(`${selectedQuantity} ${productTitle}(s) added to cart!`);
  };

  return (
    <Button
      onClick={handleAddToCart}
      className="bg-red-500 hover:bg-red-500/90 text-white px-8 py-3 h-12 w-full rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all duration-200 ease-in-out focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
      disabled={maxQty === 0 || isOwnProduct}
    >
      {maxQty === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
