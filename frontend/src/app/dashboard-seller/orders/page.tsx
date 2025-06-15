"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column, Action } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ShipOrderDialog } from "@/components/orders/ShipOrderDialog";
import { Pencil, Search, Truck, Loader2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getBackendBaseUrl } from "@/services/productService";
import { SellerOrder as Order } from "@/types";

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
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const router = useRouter();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

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

    if (searchTerm.trim() !== "") {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      processedOrders = processedOrders.filter((order) => {
        const orderIdMatch = order.id
          .toLowerCase()
          .includes(lowercasedSearchTerm);
        const buyerNameMatch = order.shippingAddress.name
          .toLowerCase()
          .includes(lowercasedSearchTerm);
        return orderIdMatch || buyerNameMatch;
      });
    }

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
        accessor: "shippingAddress.name",
        cell: (r) => r.shippingAddress.name,
      },
      {
        header: "Amount",
        accessor: "summary.total",
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
                ? "info"
                : r.status === "Shipped"
                ? "primary"
                : r.status === "Out for Delivery"
                ? "secondary"
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
      onClick: () => router.push(`/dashboard-seller/orders/${row.id}`),
      variant: "outline",
    });

    if (row.status === "Processing") {
      actions.push({
        label: "Ship Order",
        icon: <Truck className="mr-1 h-4 w-4" />,
        onClick: () => setShipOrder(row),
        variant: "default",
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
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>{" "}
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
          order={shipOrder}
          open={true}
          onOpenChange={(open) => {
            if (!open) setShipOrder(null);
          }}
        />
      )}
    </div>
  );
}
