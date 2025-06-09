// File: src/app/dashboard/orders/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Phone,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ordersData from "@/data/orders.json";
import Timeline from "@/components/orders/Timeline";

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const order = ordersData.find((o) => o.id === id);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");

  if (!order) {
    router.push("/dashboard/orders");
    return null;
  }

  const shipOrder = () => {
    order.status = "Shipped";
  };

  const confirmCancel = () => {
    order.status = "Cancelled";
    // you can store `reason` as needed
    setShowCancel(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="lg">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button size="lg" className="bg-red-500 font-semibold text-white hover:bg-gray-900">
            <Phone className="mr-2 h-4 w-4" />
            Contact Buyer
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border rounded-lg p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <img
            src={order.product.image}
            alt={order.product.name}
            className="h-20 w-20 object-cover rounded mr-6"
          />
          <div>
            <h3 className="text-lg font-semibold mb-2">{order.product.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-700">Order ID</div>
                <div>{order.id}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Date</div>
                <div>
                  {new Date(order.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Quantity</div>
                <div>{order.quantity}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Condition</div>
                <div>{order.condition}</div>
              </div>
            </div>
          </div>
        </div>
        <Badge
          variant={
            order.status === "Pending"
              ? "warning"
              : order.status === "Shipped"
              ? "secondary"
              : "destructive"
          }
          className="mt-4 md:mt-0"
        >
          {order.status}
        </Badge>
      </div>

      {/* Timeline | Buyer Info | Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline */}
        <Timeline />

        {/* Buyer Information */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Buyer Information</h4>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-medium">Buyer</p>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{order.buyer.name}</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{order.buyer.email}</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Shipping Address</p>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{order.buyer.shippingAddress}</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Payment Method</p>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span>
                  {order.buyer.paymentMethod.type} ••••{" "}
                  {order.buyer.paymentMethod.last4}{" "}
                  <span className="ml-2 text-green-600 text-xs">Paid</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Payment Info</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.paymentInfo.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.paymentInfo.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.paymentInfo.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-red-500">
                -${order.paymentInfo.discount.toFixed(2)}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.paymentInfo.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={() => setShowCancel(true)}>
          Cancel Order
        </Button>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={shipOrder}
        >
          Ship Order
        </Button>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <DialogTitle>Cancel Order?</DialogTitle>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to cancel this order? The customer will be
              notified and the order will be marked as cancelled.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Enter reason for cancellation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 text-sm">
              <p className="text-gray-600">Order Summary</p>
              <div className="mt-1 flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowCancel(false)}>
              Keep Order
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmCancel}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
