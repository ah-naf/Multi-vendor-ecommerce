"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export interface Order {
  id: string;
  date: string;
  status: string;
  product: { name: string };
  amount: number;
  buyer: { name: string };
}

export function OrderActionDialog({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);

  const displayStatus =
    order.status === "Pending" ? "Processing" : order.status;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          View
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle>Order #{order.id}</DialogTitle>
          </div>
          <p className="text-sm text-gray-500">
            Placed on{" "}
            {new Date(order.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="text-orange-500">{displayStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Product:</span>
            <span>{order.product.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span>${order.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Customer:</span>
            <span>{order.buyer.name}</span>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              // cancel logic
              setOpen(false);
            }}
          >
            Cancel Order
          </Button>
          <Button
            onClick={() => {
              // direct-ship logic
              setOpen(false);
            }}
          >
            Ship Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
