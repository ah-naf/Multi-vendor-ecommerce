"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CreditCard,
  Heart,
  User,
  MapPin,
  LifeBuoy,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  fetchTotalOrders,
  fetchWishlistItemsCount,
  fetchTotalSpent,
  fetchRecentOrders,
  fetchActiveOrder,
} from "@/services/customerDashboardService";
import { useAuth } from "@/context/AuthContext";

// --- TYPES --- (Should ideally be in a central types file)
interface RecentOrderData {
  id: string;
  date: string; // Or Date object, adjust as per API response
  summary: { total: number };
  status: string;
}

interface ActiveOrderData {
  id: string;
  status: string;
  estimatedDelivery?: string;
  // items: any[]; // if needed for display
}

// --- HELPER COMPONENTS ---
const OrderStatusStepper = ({ status }: { status: string | undefined }) => {
  if (!status) return null;
  const steps = ["Processing", "Shipped", "Delivered"]; // Add "Out for Delivery" if used by backend
  const currentStepIndex = steps.indexOf(status);

  return (
    <div className="flex items-center justify-between w-full mt-4">
      {steps.map((step, index) => {
        const isActive = index <= currentStepIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Package className="h-4 w-4" />
              </div>
              <p
                className={`mt-2 text-xs font-semibold ${
                  isActive ? "text-white" : "text-white font-bold" // Consider revising this for better contrast
                }`}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  isActive ? "bg-red-500" : "bg-gray-200" // Consider revising this for better contrast
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const StatCardLoading = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 animate-pulse">Loading...</CardTitle>
      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-gray-800 animate-pulse">-</p>
    </CardContent>
  </Card>
);

const StatCardError = ({ message }: { message: string }) => (
 <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-red-500">Error</CardTitle>
      <AlertCircle className="h-5 w-5 text-red-400" />
    </CardHeader>
    <CardContent>
      <p className="text-sm text-red-700">{message || "Failed to load"}</p>
    </CardContent>
  </Card>
);


// --- MAIN DASHBOARD OVERVIEW COMPONENT ---
export default function CustomerDashboardOverview() {
  const { user } = useAuth(); // Get user from AuthContext

  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [wishlistItems, setWishlistItems] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderData[]>([]);
  const [activeOrder, setActiveOrder] = useState<ActiveOrderData | null>(null);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(true);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(true);

  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorRecentOrders, setErrorRecentOrders] = useState<string | null>(null);
  const [errorActiveOrder, setErrorActiveOrder] = useState<string | null>(null);


  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch stats
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const [ordersRes, wishlistRes, spentRes] = await Promise.allSettled([
          fetchTotalOrders(),
          fetchWishlistItemsCount(),
          fetchTotalSpent(),
        ]);

        if (ordersRes.status === 'fulfilled') setTotalOrders(ordersRes.value.totalOrders);
        else setErrorStats(prev => prev ? `${prev}, Total Orders` : 'Total Orders');

        if (wishlistRes.status === 'fulfilled') setWishlistItems(wishlistRes.value.wishlistItemsCount);
        else setErrorStats(prev => prev ? `${prev}, Wishlist` : 'Wishlist');

        if (spentRes.status === 'fulfilled') setTotalSpent(spentRes.value.totalSpent);
        else setErrorStats(prev => prev ? `${prev}, Total Spent` : 'Total Spent');

      } catch (err) { // This catch might not be strictly necessary with Promise.allSettled if individual errors are handled
        setErrorStats('Failed to load some statistics.');
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoadingStats(false);
      }

      // Fetch recent orders
      setLoadingRecentOrders(true);
      setErrorRecentOrders(null);
      try {
        const recentOrdersRes = await fetchRecentOrders(3);
        setRecentOrders(recentOrdersRes.recentOrders);
      } catch (err: any) {
        setErrorRecentOrders(err.message || 'Failed to load recent orders.');
        console.error("Error fetching recent orders:", err);
      } finally {
        setLoadingRecentOrders(false);
      }

      // Fetch active order
      setLoadingActiveOrder(true);
      setErrorActiveOrder(null);
      try {
        const activeOrderRes = await fetchActiveOrder();
        setActiveOrder(activeOrderRes.activeOrder);
      } catch (err: any) {
        setErrorActiveOrder(err.message || 'Failed to load active order.');
        console.error("Error fetching active order:", err);
      } finally {
        setLoadingActiveOrder(false);
      }
    };

    fetchDashboardData();
  }, []);

  const userName = user?.firstName || user?.email?.split('@')[0] || "Customer";


  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here is a snapshot of your account activity.
        </p>
      </div>

      {/* Live Order Tracker */}
      {loadingActiveOrder && (
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
          <CardHeader><CardTitle className="text-xl">Your Latest Order</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="ml-2">Loading active order...</p>
          </CardContent>
        </Card>
      )}
      {errorActiveOrder && !loadingActiveOrder && (
         <Card className="bg-red-100 border-red-500 text-red-700 shadow-lg">
          <CardHeader><CardTitle className="text-xl">Active Order Status</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center py-10">
            <AlertCircle className="h-8 w-8" />
            <p className="ml-2">{errorActiveOrder}</p>
          </CardContent>
        </Card>
      )}
      {!loadingActiveOrder && !errorActiveOrder && activeOrder && (
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Your Latest Order</CardTitle>
            <CardDescription className="text-gray-400">
              Order #{activeOrder.id} is {activeOrder.status?.toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusStepper status={activeOrder.status} />
            {activeOrder.estimatedDelivery && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-300">Estimated Delivery</p>
                <p className="text-2xl font-bold">
                  {new Date(activeOrder.estimatedDelivery).toUTCString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {!loadingActiveOrder && !errorActiveOrder && !activeOrder && (
         <Card className="bg-blue-50 border-blue-300 text-blue-700 shadow-lg">
          <CardHeader><CardTitle className="text-xl">No Active Orders</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center py-10">
            <Package className="h-8 w-8" />
            <p className="ml-2">You have no orders currently being processed or shipped.</p>
          </CardContent>
        </Card>
      )}


      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent History & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingStats ? (
              <> <StatCardLoading /> <StatCardLoading /> <StatCardLoading /> </>
            ) : errorStats ? (
               <div className="md:col-span-3"><StatCardError message={`Failed to load: ${errorStats}. Some stats might be missing.`} /></div>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Orders
                    </CardTitle>
                    <Package className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">
                      {totalOrders ?? '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Wishlist
                    </CardTitle>
                    <Heart className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">
                      {wishlistItems ?? '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Spent
                    </CardTitle>
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-800">
                      ${totalSpent?.toLocaleString() ?? '-'}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecentOrders && (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                   <p className="ml-2 text-gray-500">Loading recent orders...</p>
                </div>
              )}
              {errorRecentOrders && !loadingRecentOrders && (
                <div className="text-red-500 text-center py-10">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  {errorRecentOrders}
                </div>
              )}
              {!loadingRecentOrders && !errorRecentOrders && recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-10">No recent orders found.</p>
              )}
              {!loadingRecentOrders && !errorRecentOrders && recentOrders.length > 0 && (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">#{order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            order.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="font-bold text-gray-800 mt-1">
                          ${order.summary.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Account Quick Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-1">
                {[
                  {
                    href: "/dashboard-customer/profile",
                    icon: User,
                    label: "Manage Profile",
                  },
                  { href: "/dashboard-customer/profile", icon: MapPin, label: "Shipping Addresses" }, // Updated link
                  { href: "#", icon: CreditCard, label: "Payment Methods" }, // Placeholder
                  { href: "#", icon: LifeBuoy, label: "Help & Support" }, // Placeholder
                ].map((item) => (
                  <Link href={item.href} key={item.label}>
                    <div className="flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
