"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column, Action } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
// import ordersData from "@/data/orders.json"; // Mock data removed
import { ShipOrderDialog } from "@/components/orders/ShipOrderDialog"; // Ensure path is correct
import { Pencil, Search, Truck, Loader2, XCircle } from "lucide-react"; // Added Loader2, XCircle
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getBackendBaseUrl } from "@/services/productService";

// Define the Order structure based on backend OrderDetail model
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface Order {
  id: string; // Order UUID
  date: string; // ISO String date
  status: string; // e.g., "Processing", "Shipped", "Delivered", "Cancelled"
  summary: OrderSummary;
  shippingAddress: ShippingAddress; // For buyer name
  items: OrderItem[]; // For ShipOrderDialog or future use
  cancellationReason?: string; // Added
  cancelledBy?: 'seller' | 'customer' | 'admin' | 'system' | null; // Added
  // user?: string | { name?: string; email?: string }; // Optional: if backend provides buyer details directly
}

// Define available status tabs. "Pending" for seller likely means "Processing" from backend.
type ActiveTabStatus =
  | "All"
  | "Pending"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTabStatus>("All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipOrder, setShipOrder] = useState<Order | null>(null); // For the dialog
  const router = useRouter();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState(""); // For future search implementation

  useEffect(() => {
    if (!token) {
      setError("Please log in to view orders");
      return;
    }
    const fetchSellerOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${getBackendBaseUrl()}/api/orders/seller-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "An unknown error occurred" }));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const data: Order[] = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch seller orders.");
        toast.error(err.message || "Failed to fetch seller orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchSellerOrders();
  }, [token]);

  const filteredOrders = useMemo(() => {
    let processedOrders = [...orders];

    // Filter by searchTerm first
    if (searchTerm.trim() !== "") {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      processedOrders = processedOrders.filter((order) => {
        const orderIdMatch = order.id.toLowerCase().includes(lowercasedSearchTerm);
        const buyerNameMatch = order.shippingAddress.name.toLowerCase().includes(lowercasedSearchTerm);
        return orderIdMatch || buyerNameMatch;
      });
    }

    // Then filter by activeTab
    if (activeTab === "All") return processedOrders;

    const filterStatus = activeTab === "Pending" ? "Processing" : activeTab;
    return processedOrders.filter((o) => o.status === filterStatus);
  }, [activeTab, orders, searchTerm]);

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        header: "Order ID",
        accessor: "id",
        cell: (r) => <span className="font-mono">{r.id}</span>,
      },
      {
        header: "Date",
        accessor: "date",
        cell: (r) =>
          new Date(r.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
      },
      {
        header: "Buyer",
        accessor: "shippingAddress.name", // Using shipping address name as buyer name
        cell: (r) => r.shippingAddress.name,
      },
      {
        header: "Amount",
        accessor: "summary.total", // Using summary.total for amount
        cell: (r) => `$${r.summary.total.toFixed(2)}`,
      },
      {
        header: "Status",
        accessor: "status",
        cell: (r) => (
          <Badge
            variant={
              r.status === "Processing"
                ? "warning"
                : r.status === "Packed"
                ? "info" // New: Packed status
                : r.status === "Shipped"
                ? "primary" // Changed from secondary to primary
                : r.status === "Out for Delivery"
                ? "secondary" // New: Out for Delivery status
                : r.status === "Delivered"
                ? "success"
                : r.status === "Cancelled"
                ? "destructive"
                : "default"
            }
            className="capitalize"
          >
            {r.status}
          </Badge>
        ),
      },
    ],
    []
  );

  const getOrderActions = (row: Order): Action<Order>[] => {
    const actions: Action<Order>[] = [];

    actions.push({
      label: "View Details",
      icon: <Pencil className="mr-1 h-4 w-4" />,
      onClick: () => router.push(`/dashboard-seller/orders/${row.id}`), // Corrected path
      variant: "outline",
    });

    // Only "Processing" (aka "Pending" for seller) orders can be shipped
    if (row.status === "Processing") {
      actions.push({
        label: "Ship Order",
        icon: <Truck className="mr-1 h-4 w-4" />,
        onClick: () => setShipOrder(row),
        variant: "default", // Changed to default to stand out
      });
    }
    return actions;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading seller orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 w-full">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-700">
          Error Fetching Orders
        </h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by Order ID or Buyer Name..."
            className="pl-10 bg-white h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTabStatus)}
        className="mb-4 w-full"
      >
        <TabsList className="w-full h-12 grid grid-cols-3 sm:grid-cols-5">
          {" "}
          {/* Responsive grid for tabs */}
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>{" "}
          {/* UI "Pending" maps to "Processing" status */}
          <TabsTrigger value="Shipped">Shipped</TabsTrigger>
          <TabsTrigger value="Delivered">Delivered</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 && !loading && !error ? (
        <div className="text-center py-10">
          <Pencil className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            No Orders Found
          </h2>
          <p className="mt-2 text-gray-500">
            There are no orders matching the current filter.
          </p>
        </div>
      ) : (
        <DataTable<Order>
          columns={columns}
          data={filteredOrders}
          getActions={getOrderActions}
        />
      )}

      {shipOrder && (
        <ShipOrderDialog
          order={shipOrder} // Pass the full order object of the new Order type
          open={true} // Dialog is controlled by shipOrder state != null
          onOpenChange={(open) => {
            if (!open) setShipOrder(null);
          }}
          // Optional: Add a callback for when an order is successfully shipped to refresh data
          // onOrderShipped={() => fetchSellerOrders()}
        />
      )}
    </div>
  );
}
