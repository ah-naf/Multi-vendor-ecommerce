"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";

// --- MOCK DATA & TYPES ---
const initialWishlistItems = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    attributes: "Black | Premium Edition",
    price: 249.99,
    image: "/placeholder-image.svg",
  },
  {
    id: 3,
    name: "Ultra-Thin Laptop",
    attributes: "13-inch | 16GB RAM",
    price: 1299.0,
    image: "/placeholder-image.svg",
  },
  {
    id: 5,
    name: "Professional DSLR Camera",
    attributes: "24-70mm Kit Lens",
    price: 1999.99,
    image: "/placeholder-image.svg",
  },
  {
    id: 6,
    name: "Smart Home Hub",
    attributes: "Chalk White",
    price: 129.0,
    image: "/placeholder-image.svg",
  },
  {
    id: 7,
    name: "Retro Mechanical Keyboard",
    attributes: "RGB | Brown Switches",
    price: 189.5,
    image: "/placeholder-image.svg",
  },
  {
    id: 8,
    name: "4K UHD Gaming Monitor",
    attributes: "27-inch | 144Hz",
    price: 599.0,
    image: "/placeholder-image.svg",
  },
];

type WishlistItemType = (typeof initialWishlistItems)[number];

// --- MAIN WISHLIST PAGE COMPONENT ---
export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItemType[]>(initialWishlistItems);

  // --- HANDLER FUNCTIONS ---
  const handleDeleteItem = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const handleAddToCart = (itemName: string) => {
    alert(`${itemName} added to cart!`);
  };

  // NEW: Handler to clear the entire wishlist with confirmation
  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear your entire wishlist? This action cannot be undone."
      )
    ) {
      setWishlistItems([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* UPDATED: Page Header with Clear All button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            My Wishlist
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Your collection of saved items ({wishlistItems.length} items).
          </p>
        </div>
        {/* The button only appears if there are items */}
        {wishlistItems.length > 0 && (
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
            onClick={handleClearAll}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        // --- IMPROVED EMPTY STATE ---
        <div className="text-center py-24 bg-gray-50 rounded-xl border border-dashed">
          <Heart className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-6 text-xl font-semibold text-gray-800">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-500 mt-2">
            Looks like you haven't added anything yet. Let's change that!
          </p>
          <Link href="/" passHref>
            <Button className="mt-6 h-11 px-8 bg-gray-800 text-white hover:bg-gray-900">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        // --- RESPONSIVE GRID LAYOUT ---
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            // --- MODERN PRODUCT CARD ---
            <Card
              key={item.id}
              className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-9 w-9 bg-white/70 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-600 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>

              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <CardContent className="p-4 bg-white">
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">{item.attributes}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </p>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white h-9 px-4"
                    onClick={() => handleAddToCart(item.name)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
