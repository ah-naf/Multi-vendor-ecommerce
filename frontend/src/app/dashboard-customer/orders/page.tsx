// frontend/src/app/dashboard-customer/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column, Action } from "@/components/DataTable"; // Assuming Action type is exported
import { Button } from "@/components/ui/button";
import { getCustomerOrders } from "@/services/orderService";
import type { Order } from "@/types/order"; // Using 'type' import for interfaces
import { Eye } from 'lucide-react'; // For an icon on the button

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await getCustomerOrders();
        setOrders(fetchedOrders || []); // Ensure orders is always an array
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders.");
        setOrders([]); // Clear orders on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      cell: (row) => <span className="font-mono">{row.id}</span>,
      className: "w-1/5",
    },
    {
      header: "Date",
      cell: (row) => new Date(row.date).toLocaleDateString(),
      className: "w-1/5",
    },
    {
      header: "Status",
      cell: (row) => row.status,
      className: "w-1/5",
    },
    {
      header: "Total",
      cell: (row) =>
        `$${row.summary.total.toFixed(2)}`, // Basic currency formatting
      className: "w-1/5 text-right",
    },
  ];

  const getActions = (row: Order): Action<Order>[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: () => {
        router.push(`/dashboard-customer/orders/${row.id}`);
      },
      variant: "outline",
    },
  ];

  // Make sure DataTableProps in DataTable.tsx correctly defines getActions
  // interface DataTableProps<T> {
  //   columns: Column<T>[];
  //   data: T[];
  //   getActions?: (row: T) => Action<T>[]; // Ensure this matches
  // }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading orders...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p className="text-lg text-red-500">Error fetching orders:</p>
        <p className="text-md text-red-400 bg-red-50 p-3 rounded-md">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">My Orders</h1>
      <DataTable columns={columns} data={orders} getActions={getActions} />
    </div>
  );
};

export default CustomerOrdersPage;
