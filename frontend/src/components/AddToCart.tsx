"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface AddToCartProps {
  productId: string;
  maxQty: number;
}

export function AddToCart({ productId, maxQty }: AddToCartProps) {
  const qtyRef = useRef<HTMLInputElement>(null);

  const handleAddToCart = () => {
    const raw = qtyRef.current?.value ?? "1";
    let qty = parseInt(raw, 10) || 1;
    qty = Math.max(1, Math.min(maxQty, qty));
    // TODO: replace with your real cart API call
    console.log(`Adding ${qty}× ${productId} to cart`);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-4 mb-4">
        <label htmlFor="quantity" className="font-medium text-gray-700">
          Quantity
        </label>
        <input
          id="quantity"
          ref={qtyRef}
          type="number"
          defaultValue={1}
          min={1}
          max={maxQty}
          className="w-16 border border-gray-300 rounded-md px-2 py-1"
        />
      </div>
      <Button
        onClick={handleAddToCart}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 w-full md:w-auto"
      >
        Add to Cart
      </Button>
    </div>
  );
}
