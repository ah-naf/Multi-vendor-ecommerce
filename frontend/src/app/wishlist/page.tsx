"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { HeartCrack, XCircle, ShoppingCart } from 'lucide-react'; // Added ShoppingCart
import { useCart } from '@/context/CartContext'; // Added useCart

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, getWishlistTotalItems } = useWishlist();
  const { addToCart, cartItems } = useCart(); // For "Move to Cart"

  const totalItems = getWishlistTotalItems();

  const handleMoveToCart = (wishlistItem: any) => { // Use 'any' or a more specific type for wishlistItem
    const itemForCart = {
      id: wishlistItem.id,
      name: wishlistItem.name,
      price: wishlistItem.price,
      image: wishlistItem.image,
      // quantity: 1, // Default quantity when moving to cart
    };

    const itemInCart = cartItems.find(item => item.id === wishlistItem.id);
    // Assuming maxQty isn't readily available on wishlist item, basic add. Advanced check would need product details.
    // For simplicity, we add 1. If you want to check against stock, you'd need to fetch product details here or ensure WishlistItem has stock info.

    addToCart(itemForCart, 1); // Add 1 quantity by default
    removeFromWishlist(wishlistItem.id); // Remove from wishlist after adding to cart
    toast.success(`${wishlistItem.name} moved to cart!`);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <span className="text-lg text-gray-700">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartCrack className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-700 mb-2">Your wishlist is empty.</p>
            <p className="text-gray-500 mb-6">Explore products and add your favorites to your wishlist!</p>
            <Link href="/" passHref>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Discover Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id || item._id} className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl">
                <Link href={`/products/${item.id}`} passHref>
                  <div className="relative w-full h-60 bg-gray-100">
                    <Image
                      src={item.image || '/placeholder-image.svg'}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{item.category || 'N/A'}</p>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={item.name}>
                    <Link href={`/products/${item.id}`} passHref className="hover:text-red-600 transition-colors">
                      {item.name}
                    </Link>
                  </h3>
                  <p className="text-xl font-bold text-red-600 mb-4">${item.price.toFixed(2)}</p>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingCart className="h-5 w-5" /> Move to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                      onClick={() => removeFromWishlist(item.id)}
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
