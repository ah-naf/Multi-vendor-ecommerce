"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column, Action } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  XCircle,
  PackageCheck,
  RefreshCw,
  Pencil,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBackendBaseUrl } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";

const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
  const statusClasses: Record<string, string> = {
    Delivered: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Processing: "bg-yellow-100 text-yellow-700",
    Packed: "bg-sky-100 text-sky-700",
    "Out for Delivery": "bg-indigo-100 text-indigo-700",
    Cancelled: "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`${baseClasses} ${
        statusClasses[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReasonInput, setCancellationReasonInput] = useState("");
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    if (!token) {
      setError("Please log in to view orders");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "An unknown server error occurred" }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to fetch orders. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleCancelOrderClick = (order: Order) => {
    setOrderToCancel(order);
    setCancellationReasonInput("");
    setShowCancelDialog(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) {
      toast.error("No order selected for cancellation.");
      return;
    }
    if (!cancellationReasonInput.trim()) {
      toast.error("Cancellation reason is required.");
      return;
    }

    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/${
          orderToCancel.id
        }/cancel-by-customer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cancellationReason: cancellationReasonInput }),
        }
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to cancel order.");
      }
      toast.success("Order cancellation requested successfully.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Error requesting cancellation.");
    } finally {
      setShowCancelDialog(false);
      setOrderToCancel(null);
      setCancellationReasonInput("");
    }
  };

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      cell: (row) => <span className="font-mono text-gray-700">{row.id}</span>,
    },
    {
      header: "Date",
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Total",
      cell: (row) => `$${row.summary.total.toFixed(2)}`,
    },
    {
      header: "Actions",
      cell: (row) => {
        const actions = getActionsForOrder(row);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(row)}
                  className={
                    action.variant === "destructive" ? "text-red-500" : ""
                  }
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const getActionsForOrder = (order: Order): Action<Order>[] => {
    const actions: Action<Order>[] = [];

    actions.push({
      label: "View Details",
      icon: <Pencil className="mr-2 h-4 w-4" />,
      onClick: (row) => router.push(`/dashboard-customer/my-order/${row.id}`), // Navigate to order detail page
      className: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    });

    switch (order.status) {
      case "Processing":
        actions.push({
          label: "Request Cancellation",
          icon: <XCircle className="mr-2 h-4 w-4" />,
          onClick: (row) => handleCancelOrderClick(row),
          className: "bg-red-600 text-white hover:bg-red-700 hover:text-white",
        });
        break;

      case "Shipped":
        actions.push({
          label: "Track Order",
          icon: <PackageCheck className="mr-2 h-4 w-4" />,
          onClick: (row) => toast.info(`Tracking order: ${row.id}`), // Placeholder for tracking logic
          className:
            "bg-blue-600 text-white hover:bg-blue-500 hover:text-white",
        });
        break;
    }

    if (order.items && order.items.length > 0) {
      actions.push({
        label: "Buy Again",
        icon: <RefreshCw className="mr-2 h-4 w-4" />,
        onClick: (row) => toast.info(`Re-ordering items from order ${row.id}`), // Placeholder for re-order logic
        className:
          "bg-green-600 text-white hover:bg-green-500 hover:text-white",
      });
    }
    return actions;
  };

  const filteredData = React.useMemo(() => {
    let processedOrders = [...orders];

    if (searchTerm.trim() !== "") {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      processedOrders = processedOrders.filter((order) =>
        order.id.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    if (statusFilter !== "all") {
      processedOrders = processedOrders.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return processedOrders;
  }, [orders, searchTerm, statusFilter]);

  const statusOptionsFromOrders = Array.from(
    new Set(orders.map((order) => order.status))
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-700">
          Failed to Load Orders
        </h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button
          className="mt-6"
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchOrders();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500">View and manage your order history.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by Order ID..."
            className="pl-10 h-12 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto h-11">
              Filter by Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <DropdownMenuRadioItem value="all">
                All Statuses
              </DropdownMenuRadioItem>
              {statusOptionsFromOrders.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {status}
                </DropdownMenuRadioItem>
              ))}
              {["Processing", "Shipped", "Delivered", "Cancelled"]
                .filter((s) => !statusOptionsFromOrders.includes(s))
                .map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {status}
                  </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <Pencil className="mx-auto h-12 w-12 text-gray-400" />{" "}
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            No Orders Yet
          </h2>
          <p className="mt-2 text-gray-500">
            It looks like you haven't placed any orders. Time to start shopping!
          </p>
          <Button onClick={() => router.push("/")} className="mt-6">
            Browse Products
          </Button>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} />
      )}

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request Order Cancellation: {orderToCancel?.id}?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to request cancellation for this order? This
              action may not be reversible if the order has already been
              processed or shipped. Please provide a reason for your request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <label
              htmlFor="cancellationReason"
              className="block text-sm font-medium text-gray-700"
            >
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancellationReason"
              value={cancellationReasonInput}
              onChange={(e) => setCancellationReasonInput(e.target.value)}
              placeholder="e.g., Placed order by mistake, item no longer needed..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancellationReasonInput.trim()}
            >
              Confirm Cancellation Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
