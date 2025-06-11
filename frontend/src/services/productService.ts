// Helper to get the API base URL
export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

// Helper for making API requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    // Credentials 'include' is important for sending cookies (auth token)
    credentials: "include",
    headers: {
      // For FormData, 'Content-Type' is set automatically by the browser.
      // For JSON, we'd set 'Content-Type': 'application/json'.
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An unknown error occurred" }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  // If response is empty or not JSON, handle appropriately
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return response.text().then((text) => (text ? { message: text } : {})); // Return success message as object
};

// Get all products for the authenticated seller
export const getSellerProducts = async () => {
  const API_URL = `${getApiBaseUrl()}/seller/products`;
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
