"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import { WishlistItem } from "@/types";
import { useAuth } from "./AuthContext"; // To check authentication status
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
} from "@/services/userProfileService";

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, "addedAt">) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  getWishlistTotalItems: () => number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({
  children,
}) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, token } = useAuth(); // Get user and token from AuthContext

  const loadWishlist = useCallback(async () => {
    if (user && token) {
      setIsLoading(true);
      try {
        const backendWishlistItems = await fetchWishlistApi();
        setWishlistItems(backendWishlistItems);
      } catch (error: any) {
        console.error("Failed to fetch wishlist:", error);
        toast.error(error.message || "Failed to load wishlist items.");
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setWishlistItems([]);
    }
  }, [user, token]);

  useEffect(() => {
    loadWishlist();
  }, [user, token]);

  const addToWishlist = async (itemToAdd: Omit<WishlistItem, "addedAt">) => {
    if (!user) {
      toast.error("Please log in to add items to your wishlist.");
      return;
    }
    // Check if item already exists locally to prevent redundant API calls if backend also checks
    if (wishlistItems.some((item) => item.productId === itemToAdd.productId)) {
      toast.info(`${itemToAdd.name} is already in your wishlist.`);
      return;
    }
    setIsLoading(true);
    try {
      // itemToAdd directly matches what addToWishlistApi expects (productId, name, price, image, attributes)
      const updatedWishlist = await addToWishlistApi(itemToAdd);
      setWishlistItems(updatedWishlist);
      toast.success(`${itemToAdd.name} added to wishlist!`);
    } catch (error: any) {
      console.error("Failed to add to wishlist:", error);
      toast.error(error.message || "Failed to add item to wishlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedWishlist = await removeFromWishlistApi(productId);
      setWishlistItems(updatedWishlist);
      const itemRemoved = wishlistItems.find(
        (item) => item.productId === productId
      );
      toast.info(
        `${itemRemoved ? itemRemoved.name : "Item"} removed from wishlist.`
      );
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      toast.error(error.message || "Failed to remove item from wishlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlistItems.some((item) => item.productId === productId);
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
    isLoading,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
