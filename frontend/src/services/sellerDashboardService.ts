export interface SalesData {
  period: string;
  totalSales: number;
  totalOrdersCount: number;
}

export interface SalesPerformanceData {
  currentMonthSales: number;
  previousMonthSales: number;
  performanceTrend: string;
  percentageChange: number;
}

export interface OrderStatusCountsData {
  Pending: number;
  Processing: number;
  Shipped: number;
  Delivered: number;
  Cancelled: number;
  [key: string]: number;
}

export interface RevenueTrend {
  name: string;
  revenue: number;
}

export interface LowStockCountData {
  lowStockProductCount: number;
  threshold: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DASHBOARD_API_URL = `${API_BASE_URL}/seller/dashboard`;

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

export const fetchSalesDataForPeriod = async (
  period: "today" | "week" | "month" | "year"
): Promise<SalesData> => {
  const token = getAuthToken();
  const response = await fetch(
    `${DASHBOARD_API_URL}/sales-data?period=${period}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );
  return handleResponse(response);
};

export const fetchSalesPerformance =
  async (): Promise<SalesPerformanceData> => {
    const token = getAuthToken();
    const response = await fetch(`${DASHBOARD_API_URL}/sales-performance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  };

export const fetchOrderStatusCounts =
  async (): Promise<OrderStatusCountsData> => {
    const token = getAuthToken();
    const response = await fetch(`${DASHBOARD_API_URL}/order-status-counts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(response);
  };

export const fetchRevenueTrend = async (): Promise<RevenueTrend[]> => {
  const token = getAuthToken();
  const response = await fetch(`${DASHBOARD_API_URL}/revenue-trend`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};

export const fetchLowStockCount = async (
  threshold?: number
): Promise<LowStockCountData> => {
  const token = getAuthToken();
  let url = `${DASHBOARD_API_URL}/low-stock-count`;
  if (threshold !== undefined) {
    url += `?threshold=${threshold}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse(response);
};
