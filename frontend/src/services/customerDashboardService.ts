// frontend/src/services/customerDashboardService.ts

// Define types for the expected API responses (optional but good practice)
// These should match the structure returned by your backend endpoints.
interface TotalOrdersResponse {
  totalOrders: number;
}

interface WishlistItemsCountResponse {
  wishlistItemsCount: number;
}

interface TotalSpentResponse {
  totalSpent: number;
}

// Assuming RecentOrder and ActiveOrder types are defined in @/types or similar
// For now, using 'any' for simplicity if those types are not readily available.
// Ideally, import these from a central types definition file.
interface RecentOrder {
  id: string; // orderId
  items: any[]; // Simplified
  status: string;
  summary: { total: number };
  date: string; // Or Date
}

interface ActiveOrder {
  id: string; // orderId
  items: any[]; // Simplified
  status: string;
  summary: { total: number };
  estimatedDelivery?: string;
  date: string; // Or Date
}

interface RecentOrdersResponse {
  recentOrders: RecentOrder[];
}

interface ActiveOrderResponse {
  activeOrder: ActiveOrder | null;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DASHBOARD_API_URL = `${API_BASE_URL}/customer/dashboard`;

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwtToken");
  }
  return null;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText })); // Provide fallback if .json() fails
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  return response.json();
};

// Fetch Total Orders
export const fetchTotalOrders = async (): Promise<TotalOrdersResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/total-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};

// Fetch Wishlist Items Count
export const fetchWishlistItemsCount = async (): Promise<WishlistItemsCountResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/wishlist-items-count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};

// Fetch Total Spent
export const fetchTotalSpent = async (): Promise<TotalSpentResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/total-spent`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};

// Fetch Recent Orders
export const fetchRecentOrders = async (limit: number = 3): Promise<RecentOrdersResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/recent-orders?limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};

// Fetch Active Order
export const fetchActiveOrder = async (): Promise<ActiveOrderResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/active-order`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};
