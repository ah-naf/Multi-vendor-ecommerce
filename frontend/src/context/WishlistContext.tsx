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
import { useAuth } from "./AuthContext";
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  clearWishlistApi,
} from "@/services/userProfileService";

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, "addedAt">) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist?: () => Promise<void>;
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
  const { user, token } = useAuth();

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
    if (wishlistItems.some((item) => item.productId === itemToAdd.productId)) {
      toast.info(`${itemToAdd.name} is already in your wishlist.`);
      return;
    }
    setIsLoading(true);
    try {
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

  const clearWishlist = async () => {
    if (!user) {
      toast.error("Please log in to clear your wishlist.");
      return;
    }
    setIsLoading(true);
    try {
      await clearWishlistApi();
      setWishlistItems([]);
      toast.success("Wishlist cleared successfully!");
    } catch (error: any) {
      console.error("Failed to clear wishlist:", error);
      toast.error(error.message || "Failed to clear wishlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
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
