// File Path: src/app/dashboard/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Search, ChevronDown, AlertCircle } from "lucide-react";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

// --- MOCK DATA ---
const salesData = {
  today: 2450,
  week: 10230,
  month: 45670,
};

const salesPerformance = {
  today: 15,
  week: 8,
  month: 12,
};

const ordersStatus = {
  pending: 12,
  shipped: 24,
  delivered: 156,
  cancelled: 3,
};

const revenueTrendData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
  { name: "Jul", revenue: 7000 },
  { name: "Aug", revenue: 6500 },
  { name: "Sep", revenue: 7500 },
  { name: "Oct", revenue: 8000 },
  { name: "Nov", revenue: 9000 },
  { name: "Dec", revenue: 8500 },
];

const lowStockProducts = 2;

const user = {
  name: "John Doe",
};

// --- MAIN DASHBOARD COMPONENT ---
export default function SellerDashboard() {
  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen">
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back, {user.name.split(" ")[0]}!
            </h2>
            <p className="text-gray-500">
              You've made ${salesData.today.toLocaleString()} today.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by product, brand, or keyword"
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between space-x-2 w-full md:w-auto"
                >
                  <span>Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Electronics</DropdownMenuItem>
                <DropdownMenuItem>Clothing</DropdownMenuItem>
                <DropdownMenuItem>Books</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-red-500 hover:bg-red-600 text-white w-full md:w-auto flex-shrink-0">
              Search
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Sales Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-800">
                  ${salesData.today.toLocaleString()}
                </p>
                <p className="text-xs text-green-500">
                  +{salesPerformance.today}% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Sales This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-800">
                  ${salesData.week.toLocaleString()}
                </p>
                <p className="text-xs text-green-500">
                  +{salesPerformance.week}% from last period
                </p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Sales This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-800">
                  ${salesData.month.toLocaleString()}
                </p>
                <p className="text-xs text-green-500">
                  +{salesPerformance.month}% from last period
                </p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Sales This Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-800">
                  ${salesData.month.toLocaleString()}
                </p>
                <p className="text-xs text-green-500">
                  +{salesPerformance.month}% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Orders Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="flex items-center p-4">
                  <span className="h-3 w-3 rounded-full bg-yellow-400 mr-4"></span>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {ordersStatus.pending}
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
                      {ordersStatus.shipped}
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
                      {ordersStatus.delivered}
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
                      {ordersStatus.cancelled}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Revenue Trend (30 days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueTrendData}
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
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p>
                You have {lowStockProducts} products running low. Restock now.
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white text-gray-800 self-end sm:self-center"
            >
              View Products
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
