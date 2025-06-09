"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import ordersData from "@/data/orders.json";
import { ShipOrderDialog } from "@/components/orders/ShipOrderDialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Order = (typeof ordersData)[number];
type Status = "All" | "Pending" | "Shipped" | "Cancelled";

export default function OrdersPage() {
  const [status, setStatus] = useState<Status>("All");
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const router = useRouter();

  const filtered = useMemo(
    () =>
      status === "All"
        ? ordersData
        : ordersData.filter((o) => o.status === status),
    [status]
  );

  const columns: Column<Order>[] = useMemo(
    () => [
      { header: "Order ID", accessor: "id" },
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
        accessor: "buyer",
        cell: (r) => r.buyer.name,
      },
      {
        header: "Amount",
        accessor: "amount",
        cell: (r) => `$${r.amount.toFixed(2)}`,
      },
      {
        header: "Status",
        accessor: "status",
        cell: (r) => (
          <Badge
            variant={
              r.status === "Pending"
                ? "warning"
                : r.status === "Shipped"
                ? "secondary"
                : r.status === "Cancelled"
                ? "destructive"
                : "default"
            }
          >
            {r.status}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search by order id or customer name" className="pl-10 bg-white h-12" />
        </div>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="mb-4 w-full">
        <TabsList className="w-full h-12">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Shipped">Shipped</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable<Order>
        columns={columns}
        data={filtered}
        onEdit={(row) => router.push(`/dashboard/orders/${row.id}`)}
        onShip={(row) => setShipOrder(row)}
      />

      {/* Controlled Ship Dialog */}
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
