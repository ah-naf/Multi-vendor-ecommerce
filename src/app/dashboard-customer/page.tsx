"use client";

import React from "react";
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
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const user = {
  name: "Alex Johnson",
};

const activeOrder = {
  id: "ORD-12346",
  status: "Shipped", // Can be 'Processing', 'Shipped', 'Out for Delivery'
  estimatedDelivery: "June 12, 2025",
  items: [
    {
      name: "Wireless Noise-Cancelling Headphones",
      image: "/placeholder-image.svg",
    },
  ],
};

const stats = {
  totalOrders: 58,
  wishlistItems: 14,
  totalSpent: 4850.75,
};

const recentOrders = [
  { id: "ORD-12345", date: "May 20, 2025", total: 249.99, status: "Delivered" },
  { id: "ORD-12348", date: "May 5, 2025", total: 79.99, status: "Delivered" },
  {
    id: "ORD-12349",
    date: "April 30, 2025",
    total: 129.99,
    status: "Cancelled",
  },
];

// --- HELPER COMPONENTS ---

// Visual stepper for the live order tracker
const OrderStatusStepper = ({ status }: { status: string }) => {
  const steps = ["Processing", "Shipped", "Delivered"];
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
                  isActive ? "text-white" : "text-white font-bold"
                }`}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  isActive ? "bg-red-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// --- MAIN DASHBOARD OVERVIEW COMPONENT ---
export default function CustomerDashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here is a snapshot of your account activity.
        </p>
      </div>

      {/* Live Order Tracker */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Your Latest Order</CardTitle>
          <CardDescription className="text-gray-400">
            Order #{activeOrder.id} is on its way!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderStatusStepper status={activeOrder.status} />
          <div className="text-center mt-6">
            <p className="text-sm text-gray-300">Estimated Delivery</p>
            <p className="text-2xl font-bold">
              {activeOrder.estimatedDelivery}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent History & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Orders
                </CardTitle>
                <Package className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalOrders}
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
                  {stats.wishlistItems}
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
                  ${stats.totalSpent.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">#{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
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
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                  { href: "#", icon: MapPin, label: "Shipping Addresses" },
                  { href: "#", icon: CreditCard, label: "Payment Methods" },
                  { href: "#", icon: LifeBuoy, label: "Help & Support" },
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
