// Helper to get the API base URL
export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

export const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
};

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    // Ensure localStorage is available
    return localStorage.getItem("jwtToken");
  }
  return null;
};

// Helper for making API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {} // Content-Type is set by browser for FormData
      : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // credentials: "include", // Kept if cookies are also used, otherwise can be removed for pure token auth
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({
        message: "An unknown error occurred or non-JSON error response",
      }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  // Handle non-JSON responses, e.g., for DELETE operations that might return 204 No Content or simple text
  return response.text().then((text) => {
    try {
      return text ? JSON.parse(text) : {}; // Try to parse if text is JSON-like
    } catch (e) {
      return { message: text || "Success" }; // Return as message if not parseable or empty
    }
  });
};

// Get all products for the authenticated seller
export const getSellerProducts = async (searchTerm?: string) => {
  let API_URL = `${getApiBaseUrl()}/seller/products`;
  if (searchTerm && searchTerm.trim() !== "") {
    API_URL += `?search=${encodeURIComponent(searchTerm.trim())}`;
  }
  return apiRequest(API_URL);
};

// Get a single product by its ID for the seller
export const getSellerProductById = async (productId: string) => {
  const API_URL = `${getApiBaseUrl()}/seller/products/${productId}`;
  return apiRequest(API_URL);
};

// Create a new product
export const createProduct = async (formData: FormData) => {
  const API_URL = `${getApiBaseUrl()}/seller/products`;
  return apiRequest(API_URL, {
    method: "POST",
    body: formData, // FormData will be passed directly
  });
};

// Update an existing product
export const updateProduct = async (productId: string, formData: FormData) => {
  const API_URL = `${getApiBaseUrl()}/seller/products/${productId}`;
  return apiRequest(API_URL, {
    method: "PUT",
    body: formData, // FormData will be passed directly
  });
};

// Delete a product
export const deleteProduct = async (productId: string) => {
  const API_URL = `${getApiBaseUrl()}/seller/products/${productId}`;
  return apiRequest(API_URL, {
    method: "DELETE",
  });
};
