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
import { CartItem } from "@/types";
import { useAuth } from "./AuthContext"; // To check authentication status
import {
  fetchCartApi,
  addToCartApi,
  removeFromCartApi,
  updateCartQuantityApi,
  clearCartApi, // Import the new service function
} from "@/services/userProfileService";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity" | "productId"> & { productId: string },
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getTotalItems: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, token } = useAuth(); // Get user and token from AuthContext

  // Fetch cart from backend when user is authenticated
  const loadCart = useCallback(async () => {
    if (user && token) {
      setIsLoading(true);
      try {
        const backendCartItems = await fetchCartApi();
        setCartItems([...backendCartItems]); // Ensure new array reference
      } catch (error: any) {
        console.error("Failed to fetch cart:", error);
        toast.error(error.message || "Failed to load cart items.");
        // Potentially clear local cart if backend sync fails or user has no cart
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // User is not authenticated, clear cart
      setCartItems([]);
    }
  }, [user, token]);

  useEffect(() => {
    loadCart();
  }, [user, token]);

  const addToCart = async (
    newItemData: Omit<CartItem, "quantity" | "addedAt">,
    quantityToAdd: number = 1
  ) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    setIsLoading(true);
    try {
      // Construct the item to send to the API
      // The backend `addToCart` expects productId, quantity, name, price, image, attributes
      // `newItemData` should provide productId, name, price, image, attributes
      const itemToSend: Omit<CartItem, "addedAt"> = {
        productId: newItemData.productId,
        name: newItemData.name,
        price: newItemData.price,
        image: newItemData.image,
        attributes: newItemData.attributes,
        quantity: quantityToAdd, // API will handle if it's new or update
      };

      const updatedCart = await addToCartApi(itemToSend);
      setCartItems([...updatedCart]); // Ensure new array reference
      toast.success("Item added to cart!");
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      toast.error(error.message || "Failed to add item to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return; // Should not happen if items are in cart
    setIsLoading(true);
    try {
      const updatedCart = await removeFromCartApi(productId);
      setCartItems([...updatedCart]); // Ensure new array reference
      toast.info("Item removed from cart.");
    } catch (error: any) {
      console.error("Failed to remove from cart:", error);
      toast.error(error.message || "Failed to remove item from cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeFromCart(productId); // Backend will also handle this, but good for immediate UI
      return;
    }
    setIsLoading(true);
    try {
      const updatedCart = await updateCartQuantityApi(productId, quantity);
      setCartItems([...updatedCart]); // Ensure new array reference
      // toast.info("Cart updated."); // Can be noisy, consider removing
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      toast.error(error.message || "Failed to update item quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user || !token) { // Check for user and ensure token is present
      toast.error("Please log in to modify your cart.");
      return;
    }
    setIsLoading(true);
    try {
      await clearCartApi(token); // Call the new API endpoint, passing the token
      setCartItems([]); // Set frontend cart to empty
      toast.info("Cart cleared successfully.");
    } catch (error: any) {
      console.error("Failed to clear cart:", error);
      toast.error(error.message || "Failed to clear cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getTotalItems,
    isLoading,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
