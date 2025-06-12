import { CartItem, WishlistItem, UserProfile, Address, UpdateUserProfileData, AddressData } from "@/types";

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

// User Profile API Functions

const USER_API_URL = `${API_BASE_URL}/users`; // Specific base for user routes

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const token = getAuthToken();
  const response = await fetch(`${USER_API_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch user profile");
  }
  return response.json();
};

export const updateUserProfile = async (profileData: UpdateUserProfileData): Promise<UserProfile> => {
  const token = getAuthToken();
  const response = await fetch(`${USER_API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user profile");
  }
  return response.json();
};

// Address API Functions

export const addAddress = async (addressData: AddressData): Promise<Address> => { // Backend returns the new address
  const token = getAuthToken();
  const response = await fetch(`${USER_API_URL}/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(addressData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add address");
  }
  return response.json(); // Assuming backend returns the newly added address object
};

export const updateAddress = async (addressId: string, addressData: Partial<AddressData>): Promise<Address[]> => { // Backend returns updated addresses array
  const token = getAuthToken();
  const response = await fetch(`${USER_API_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(addressData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update address");
  }
  return response.json(); // Assuming backend returns the full updated list of addresses
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

export const deleteAddress = async (addressId: string): Promise<{ message: string; addresses: Address[] }> => {
  const token = getAuthToken();
  const response = await fetch(`${USER_API_URL}/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete address");
  }
  return response.json(); // Assuming backend returns a message and the updated list of addresses
};

export const setDefaultAddress = async (addressId: string): Promise<Address[]> => { // Backend returns updated addresses array
  const token = getAuthToken();
  const response = await fetch(`${USER_API_URL}/addresses/${addressId}/default`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to set default address");
  }
  return response.json(); // Assuming backend returns the full updated list of addresses
};
