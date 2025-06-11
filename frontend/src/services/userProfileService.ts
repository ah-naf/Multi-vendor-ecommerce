import { CartItem, WishlistItem } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    // Ensure localStorage is available
    return localStorage.getItem("jwtToken");
  }
  return null;
};

// Cart API Functions

export const fetchCartApi = async (): Promise<CartItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Conditionally add Auth header
    },
  });
  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.message || "Failed to fetch cart");
  }
  return response.json();
};

export const addToCartApi = async (
  item: Omit<CartItem, "addedAt">
): Promise<CartItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add item to cart");
  }
  return response.json(); // Assuming backend returns the updated cart
};
export const removeFromCartApi = async (
  productId: string
): Promise<CartItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to remove item from cart");
  }
  return response.json(); // Assuming backend returns the updated cart
};

export const updateCartQuantityApi = async (
  productId: string,
  quantity: number
): Promise<CartItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update cart item quantity");
  }
  return response.json(); // Assuming backend returns the updated cart
};

// Wishlist API Functions

export const fetchWishlistApi = async (): Promise<WishlistItem[]> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  console.log(response);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch wishlist");
  }
  return response.json();
};

export const addToWishlistApi = async (
  item: Omit<WishlistItem, "addedAt">
): Promise<WishlistItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add item to wishlist");
  }
  return response.json(); // Assuming backend returns the updated wishlist
};

export const clearWishlistApi = async (): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to clear wishlist");
  }
  // No specific content expected on successful clear, so no need to return response.json()
  // If the backend does return the (now empty) wishlist, you could return response.json()
};

export const removeFromWishlistApi = async (
  productId: string
): Promise<WishlistItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to remove item from wishlist");
  }
  return response.json(); // Assuming backend returns the updated wishlist
};
