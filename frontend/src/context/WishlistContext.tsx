"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { WishlistItem } from '@/types'; // Import WishlistItem from types

// 1. WishlistItem Type is now imported from @/types
// export interface WishlistItem {
//   id: string;        // Product's unique ID (custom 'id' field)
//   _id?: string;       // MongoDB ID, if available and needed
//   name: string;
//   price: number;     // Current price or default price
//   image?: string;    // Primary image URL
//   category?: string;
//   // Add any other fields you want to store/display in the wishlist
// }

// 2. Define WishlistContext State and Functions
interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isWishlisted: (itemId: string) => boolean;
  getWishlistTotalItems: () => number;
}

// Create WishlistContext
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// WishlistProvider Component
interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // 3. Load wishlist from localStorage on initial load
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlistItems');
    if (storedWishlist) {
      try {
        const parsedWishlist = JSON.parse(storedWishlist);
        if (Array.isArray(parsedWishlist)) { // Basic validation
          setWishlistItems(parsedWishlist);
        } else {
          localStorage.removeItem('wishlistItems'); // Clear invalid data
        }
      } catch (error) {
        console.error("Failed to parse wishlist items from localStorage:", error);
        localStorage.removeItem('wishlistItems'); // Clear corrupted data
      }
    }
  }, []);

  // 4. Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (itemToAdd: WishlistItem) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        toast.info(`${itemToAdd.name} is already in your wishlist.`);
        return prevItems; // Prevent duplicates
      } else {
        toast.success(`${itemToAdd.name} added to wishlist!`);
        return [...prevItems, itemToAdd];
      }
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId);
      if (itemToRemove) {
        toast.info(`${itemToRemove.name} removed from wishlist.`);
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const isWishlisted = (itemId: string): boolean => {
    return wishlistItems.some(item => item.id === itemId);
  };

  const getWishlistTotalItems = (): number => {
    return wishlistItems.length;
  };

  const contextValue = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    getWishlistTotalItems,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

// useWishlist Hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
