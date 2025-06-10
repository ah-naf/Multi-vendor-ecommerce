"use client";

import React from "react";
import { DataTable, Column, Action } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
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
} from "lucide-react";

// --- MOCK DATA & TYPE DEFINITION ---
interface Order {
  id: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  total: number;
}

const orders: Order[] = [
  { id: "ORD-12345", date: "May 20, 2023", status: "Delivered", total: 249.99 },
  { id: "ORD-12346", date: "May 15, 2023", status: "Shipped", total: 399.99 },
  {
    id: "ORD-12347",
    date: "May 10, 2023",
    status: "Processing",
    total: 159.98,
  },
  { id: "ORD-12348", date: "May 5, 2023", status: "Delivered", total: 79.99 },
  {
    id: "ORD-12349",
    date: "April 30, 2023",
    status: "Cancelled",
    total: 129.99,
  },
];

// --- HELPER COMPONENT FOR STATUS BADGE ---
const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
  const statusClasses = {
    Delivered: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Processing: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>
  );
};

// --- MY ORDERS PAGE COMPONENT ---
export default function MyOrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState("all");

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessor: "id",
      cell: (row) => <span className="font-mono text-gray-700">#{row.id}</span>,
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Total",
      accessor: "total",
      cell: (row) => `$${row.total.toFixed(2)}`,
    },
  ];

  const getActionsForOrder = (order: Order): Action<Order>[] => {
    const actions: Action<Order>[] = [];

    actions.push({
      label: "View",
      icon: <Pencil className="mr-2 h-4 w-4" />,
      onClick: (row) => alert(`Cancelling order: ${row.id}`),
      className: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    });

    switch (order.status) {
      case "Processing":
        actions.push({
          label: "Cancel",
          icon: <XCircle className="mr-2 h-4 w-4" />,
          onClick: (row) => alert(`Cancelling order: ${row.id}`),
          className: "bg-red-600 text-white hover:bg-red-700 hover:text-white",
        });
        break;

      case "Shipped":
        actions.push({
          label: "Track",
          icon: <PackageCheck className="mr-2 h-4 w-4" />,
          onClick: (row) => alert(`Tracking order: ${row.id}`),
          className:
            "bg-blue-600 text-white hover:bg-blue-500 hover:text-white",
        });
        actions.push({
          label: "Buy Again",
          icon: <RefreshCw className="mr-2 h-4 w-4" />,
          onClick: (row) => alert(`Buying ${row.id} again`),
          className:
            "bg-green-600 text-white hover:bg-green-500 hover:text-white",
        });
        break;

      case "Delivered":
      case "Cancelled":
        actions.push({
          label: "Buy Again",
          icon: <RefreshCw className="mr-2 h-4 w-4" />,
          onClick: (row) => alert(`Buying ${row.id} again`),
          className:
            "bg-green-600 text-white hover:bg-green-500 hover:text-white",
        });
        break;

      // 'Cancelled' orders will have no actions
      default:
        break;
    }
    return actions;
  };

  const filteredData = orders.filter((order) => {
    return statusFilter === "all" || order.status === statusFilter;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500">View and manage your order history.</p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by order ID..."
            className="pl-10 h-12 bg-white"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto h-11">
              Order Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Delivered">
                Delivered
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Shipped">
                Shipped
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Processing">
                Processing
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Cancelled">
                Cancelled
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        getActions={getActionsForOrder}
      />
    </>
  );
}
