// File Path: src/app/dashboard/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  fetchSalesDataForPeriod,
  fetchSalesPerformance, // This is a placeholder API
  fetchOrderStatusCounts,
  fetchRevenueTrend, // This is a placeholder API
  fetchLowStockCount,
  SalesData,
  SalesPerformanceData,
  OrderStatusCountsData,
  RevenueTrend,
  LowStockCountData,
} from "@/services/sellerDashboardService";
import { useAuth } from "@/context/AuthContext";

// Helper for loading state in cards
const LoadingCardContent = () => (
  <div className="flex justify-center items-center h-20">
    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function SellerDashboard() {
  const { user } = useAuth();

  const [salesTodayData, setSalesTodayData] = useState<SalesData | null>(null);
  const [salesMonthData, setSalesMonthData] = useState<SalesData | null>(null);
  // SalesPerformanceData is fetched but its backend is a placeholder, so UI will reflect that.
  const [salesPerformance, setSalesPerformance] = useState<SalesPerformanceData | null>(null);
  const [orderStatusCounts, setOrderStatusCounts] = useState<OrderStatusCountsData | null>(null);
  // RevenueTrend is fetched but its backend is a placeholder.
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [lowStockCount, setLowStockCount] = useState<LowStockCountData | null>(null);

  const [loadingSalesToday, setLoadingSalesToday] = useState(true);
  const [loadingSalesMonth, setLoadingSalesMonth] = useState(true);
  const [loadingSalesPerf, setLoadingSalesPerf] = useState(true);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState(true);
  const [loadingRevenueTrend, setLoadingRevenueTrend] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);

  const [errorSalesToday, setErrorSalesToday] = useState<string | null>(null);
  const [errorSalesMonth, setErrorSalesMonth] = useState<string | null>(null);
  // Error state for sales performance (though it's a placeholder)
  const [errorSalesPerf, setErrorSalesPerf] = useState<string | null>(null);
  const [errorOrderStatus, setErrorOrderStatus] = useState<string | null>(null);
  const [errorRevenueTrend, setErrorRevenueTrend] = useState<string | null>(null);
  const [errorLowStock, setErrorLowStock] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Sales Data (Today)
      setLoadingSalesToday(true);
      fetchSalesDataForPeriod('today')
        .then(setSalesTodayData)
        .catch(err => setErrorSalesToday(err.message || "Failed to load today's sales"))
        .finally(() => setLoadingSalesToday(false));

      // Sales Data (Month)
      setLoadingSalesMonth(true);
      fetchSalesDataForPeriod('month')
        .then(setSalesMonthData)
        .catch(err => setErrorSalesMonth(err.message || "Failed to load month's sales"))
        .finally(() => setLoadingSalesMonth(false));

      // Sales Performance (Placeholder)
      setLoadingSalesPerf(true);
      fetchSalesPerformance()
        .then(setSalesPerformance)
        .catch(err => setErrorSalesPerf(err.message || "Failed to load sales performance"))
        .finally(() => setLoadingSalesPerf(false));

      // Order Status Counts
      setLoadingOrderStatus(true);
      fetchOrderStatusCounts()
        .then(setOrderStatusCounts)
        .catch(err => setErrorOrderStatus(err.message || "Failed to load order statuses"))
        .finally(() => setLoadingOrderStatus(false));

      // Revenue Trend (Placeholder)
      setLoadingRevenueTrend(true);
      fetchRevenueTrend()
        .then(setRevenueTrend)
        .catch(err => setErrorRevenueTrend(err.message || "Failed to load revenue trend"))
        .finally(() => setLoadingRevenueTrend(false));

      // Low Stock Count
      setLoadingLowStock(true);
      fetchLowStockCount(5) // Default threshold 5
        .then(setLowStockCount)
        .catch(err => setErrorLowStock(err.message || "Failed to load low stock count"))
        .finally(() => setLoadingLowStock(false));
    };
    fetchData();
  }, []);

  const userName = user?.firstName || user?.email?.split('@')[0] || "Seller";

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back, {userName}!
        </h2>
        <p className="text-gray-500">
          {loadingSalesToday && "Loading today's sales..."}
          {errorSalesToday && `Error: ${errorSalesToday}`}
          {!loadingSalesToday && !errorSalesToday && salesTodayData &&
            `You've made $${salesTodayData.totalSales.toLocaleString()} today.`
          }
           {!loadingSalesToday && !errorSalesToday && !salesTodayData && "Could not load today's sales."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {/* Sales Today Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Sales Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSalesToday ? <LoadingCardContent /> : errorSalesToday ? <p className="text-xs text-red-500">{errorSalesToday}</p> : (
              <>
                <p className="text-3xl font-bold text-gray-800">
                  ${salesTodayData?.totalSales.toLocaleString() ?? 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  {/* Performance data is placeholder */}
                  {salesPerformance?.percentageChange !== undefined ? `${salesPerformance.percentageChange >= 0 ? '+' : ''}${salesPerformance.percentageChange}% from last period` : "Performance N/A"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales This Month Card (using salesMonthData) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Sales This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSalesMonth ? <LoadingCardContent /> : errorSalesMonth ? <p className="text-xs text-red-500">{errorSalesMonth}</p> : (
              <>
                <p className="text-3xl font-bold text-gray-800">
                  ${salesMonthData?.totalSales.toLocaleString() ?? 'N/A'}
                </p>
                 <p className="text-xs text-gray-500">
                    {/* Performance data is placeholder */}
                   {salesPerformance?.percentageChange !== undefined ? `${salesPerformance.percentageChange >= 0 ? '+' : ''}${salesPerformance.percentageChange}% from last period` : "Performance N/A"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales This Week Card (Placeholder - shows N/A or loading) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Sales This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingCardContent />
            {/* Or show N/A as this specific period isn't fetched by default */}
            {/* <p className="text-3xl font-bold text-gray-800">N/A</p> */}
            {/* <p className="text-xs text-gray-500">Performance N/A</p> */}
          </CardContent>
        </Card>

        {/* Sales This Year Card (Placeholder - shows N/A or loading) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Sales This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingCardContent />
             {/* Or show N/A as this specific period isn't fetched by default */}
            {/* <p className="text-3xl font-bold text-gray-800">N/A</p> */}
            {/* <p className="text-xs text-gray-500">Performance N/A</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Orders Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Orders Status
        </h3>
        {loadingOrderStatus ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><Card><LoadingCardContent/></Card><Card><LoadingCardContent/></Card><Card><LoadingCardContent/></Card><Card><LoadingCardContent/></Card></div> :
         errorOrderStatus ? <p className="text-red-500">{errorOrderStatus}</p> :
         !orderStatusCounts ? <p>No order status data available.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <span className="h-3 w-3 rounded-full bg-yellow-400 mr-4"></span>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStatusCounts.Pending ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <span className="h-3 w-3 rounded-full bg-blue-500 mr-4"></span>
                <div>
                  <p className="text-sm text-gray-500">Shipped</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStatusCounts.Shipped ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-4"></span>
                <div>
                  <p className="text-sm text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStatusCounts.Delivered ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <span className="h-3 w-3 rounded-full bg-red-500 mr-4"></span>
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStatusCounts.Cancelled ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Revenue Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Trend (Monthly - Placeholder Data)</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] w-full">
          {loadingRevenueTrend ? <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-gray-400" /></div> :
           errorRevenueTrend ? <p className="text-red-500 text-center py-10">{errorRevenueTrend}</p> :
           revenueTrend.length === 0 ? <p className="text-gray-500 text-center py-10">No revenue data available.</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueTrend} // Using fetched (but currently placeholder) data
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(239, 246, 255, 0.5)" }}
                  contentStyle={{
                    background: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {loadingLowStock ? <div className="flex items-center p-4"><Loader2 className="h-5 w-5 mr-3 flex-shrink-0 animate-spin" /> <p>Loading low stock info...</p></div> :
       errorLowStock ? <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"><p>{errorLowStock}</p></div> :
       lowStockCount && lowStockCount.lowStockProductCount > 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-2 sm:mb-0">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p>You have {lowStockCount.lowStockProductCount} products running low (threshold: {lowStockCount.threshold}). Restock now.</p>
          </div>
          <Button
            variant="outline"
            className="bg-white text-gray-800 self-end sm:self-center"
            // onClick={() => router.push('/dashboard-seller/products?filter=lowstock')} // Example navigation
          >
            View Products
          </Button>
        </div>
      ) : (
        <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded-md flex items-center">
           <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" /> {/* Or a different icon like CheckCircle */}
          <p>No products are currently below the low stock threshold ({lowStockCount?.threshold ?? 5}).</p>
        </div>
      )}
    </>
  );
}
