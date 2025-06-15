export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

export const getBackendBaseUrl = () => {
  console.log(process.env.NEXT_PUBLIC_BACKEND_BASE_URL);
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
};

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwtToken");
  }
  return null;
};

const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
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
  return response.text().then((text) => {
    try {
      return text ? JSON.parse(text) : {};
    } catch (e: any) {
      console.log(e);
      return { message: text || "Success" };
    }
  });
};

export const getSellerProducts = async (searchTerm?: string) => {
  let API_URL = `${getApiBaseUrl()}/seller/products`;
  if (searchTerm && searchTerm.trim() !== "") {
    API_URL += `?search=${encodeURIComponent(searchTerm.trim())}`;
  }
  return apiRequest(API_URL);
};

export const getSellerProductById = async (productId: string) => {
  const API_URL = `${getApiBaseUrl()}/seller/products/${productId}`;
  return apiRequest(API_URL);
};

export const createProduct = async (formData: FormData) => {
  const API_URL = `${getApiBaseUrl()}/seller/products`;
  return apiRequest(API_URL, {
    method: "POST",
    body: formData,
  });
};

export const updateProduct = async (productId: string, formData: FormData) => {
  const API_URL = `${getApiBaseUrl()}/seller/products/${productId}`;
  return apiRequest(API_URL, {
    method: "PUT",
    body: formData,
  });
};

export const deleteProduct = async (productId: string) => {
  const API_URL = `${getApiBaseUrl()}/seller/products/${productId}`;
  return apiRequest(API_URL, {
    method: "DELETE",
  });
};
