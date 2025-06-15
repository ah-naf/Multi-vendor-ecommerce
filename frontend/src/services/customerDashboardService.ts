interface TotalOrdersResponse {
  totalOrders: number;
}

interface WishlistItemsCountResponse {
  wishlistItemsCount: number;
}

interface TotalSpentResponse {
  totalSpent: number;
}

interface RecentOrder {
  id: string;
  items: any[];
  status: string;
  summary: { total: number };
  date: string;
}

interface ActiveOrder {
  id: string;
  items: any[];
  status: string;
  summary: { total: number };
  estimatedDelivery?: string;
  date: string;
}

interface RecentOrdersResponse {
  recentOrders: RecentOrder[];
}

interface ActiveOrderResponse {
  activeOrder: ActiveOrder | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DASHBOARD_API_URL = `${API_BASE_URL}/customer/dashboard`;

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwtToken");
  }
  return null;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }
  return response.json();
};

export const fetchTotalOrders = async (): Promise<TotalOrdersResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/total-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const fetchWishlistItemsCount =
  async (): Promise<WishlistItemsCountResponse> => {
    const token = getAuthToken();
    const response = await fetch(`${DASHBOARD_API_URL}/wishlist-items-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  };

export const fetchTotalSpent = async (): Promise<TotalSpentResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/total-spent`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const fetchRecentOrders = async (
  limit: number = 3
): Promise<RecentOrdersResponse> => {
  const token = getAuthToken();
  const response = await fetch(
    `${DASHBOARD_API_URL}/recent-orders?limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return handleResponse(response);
};

export const fetchActiveOrder = async (): Promise<ActiveOrderResponse> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/active-order`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};
