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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  MapPin,
  CreditCard,
  RefreshCw,
  FileText,
  XCircle,
  Truck,
  CheckCircle,
} from "lucide-react";

// --- MOCK DATA ARRAY ---
// This array contains all possible order details for demonstration.
const allOrderDetails = [
  // 1. Delivered Order
  {
    id: "ORD-DELIVERED",
    date: "May 20, 2025",
    status: "Delivered",
    deliveredDate: "May 25, 2025",
    shippingAddress: {
      name: "Alex Johnson",
      address: "123 Innovation Drive, Suite 456",
      city: "Techville",
      state: "CA",
      zip: "90210",
    },
    payment: {
      method: "Visa",
      last4: "1234",
      billingAddress: "Same as shipping",
    },
    items: [
      {
        id: 1,
        name: "Wireless Noise-Cancelling Headphones",
        attributes: "Black | Premium Edition",
        price: 249.99,
        quantity: 1,
        image: "/placeholder-image.svg",
      },
    ],
    summary: { subtotal: 249.99, shipping: 0.0, tax: 25.0, total: 274.99 },
  },
  // 2. Shipped Order
  {
    id: "ORD-SHIPPED",
    date: "June 8, 2025",
    status: "Shipped",
    trackingNumber: "1Z999AA10123456789",
    carrier: "UPS",
    estimatedDelivery: "June 12, 2025",
    shippingAddress: {
      name: "Alex Johnson",
      address: "123 Innovation Drive, Suite 456",
      city: "Techville",
      state: "CA",
      zip: "90210",
    },
    payment: {
      method: "Visa",
      last4: "1234",
      billingAddress: "Same as shipping",
    },
    items: [
      {
        id: 2,
        name: "Smart Fitness Watch",
        attributes: "Graphite | Large",
        price: 199.5,
        quantity: 1,
        image: "/placeholder-image.svg",
      },
    ],
    summary: { subtotal: 199.5, shipping: 0.0, tax: 19.95, total: 219.45 },
  },
  // 3. Processing Order
  {
    id: "ORD-PROCESSING",
    date: "June 10, 2025",
    status: "Processing",
    estimatedShipDate: "June 11, 2025",
    shippingAddress: {
      name: "Alex Johnson",
      address: "123 Innovation Drive, Suite 456",
      city: "Techville",
      state: "CA",
      zip: "90210",
    },
    payment: {
      method: "Visa",
      last4: "1234",
      billingAddress: "Same as shipping",
    },
    items: [
      {
        id: 3,
        name: "Ultra-Thin Laptop",
        attributes: "13-inch | 16GB RAM",
        price: 1299.0,
        quantity: 1,
        image: "/placeholder-image.svg",
      },
    ],
    summary: { subtotal: 1299.0, shipping: 0.0, tax: 129.9, total: 1428.9 },
  },
  // 4. Cancelled Order
  {
    id: "ORD-CANCELLED",
    date: "June 5, 2025",
    status: "Cancelled",
    cancelledDate: "June 6, 2025",
    refundStatus: "Processed on June 7, 2025",
    shippingAddress: {
      name: "Alex Johnson",
      address: "123 Innovation Drive, Suite 456",
      city: "Techville",
      state: "CA",
      zip: "90210",
    },
    payment: {
      method: "Visa",
      last4: "1234",
      billingAddress: "Same as shipping",
    },
    items: [
      {
        id: 4,
        name: "Portable Bluetooth Speaker",
        attributes: "Ocean Blue",
        price: 79.99,
        quantity: 2,
        image: "/placeholder-image.svg",
      },
    ],
    summary: { subtotal: 159.98, shipping: 0.0, tax: 16.0, total: 175.98 },
  },
];

// --- HELPER UI COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    Delivered: "bg-green-100 text-green-800 border-green-300",
    Shipped: "bg-blue-100 text-blue-800 border-blue-300",
    Processing: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <Badge
      className={`px-3 py-1 text-sm border ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </Badge>
  );
};

const OrderTracker = ({ status }: { status: string }) => {
  const steps = ["Processing", "Shipped", "Delivered"];
  const currentStepIndex = steps.indexOf(status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Progress</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      isActive ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1.5 mx-2 rounded-full ${
                      isActive ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const ShippedInfoCard = ({ order }: { order: any }) => (
  <Card className="bg-blue-50 border-blue-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-blue-900">
        <Truck /> On Its Way!
      </CardTitle>
      <CardDescription className="text-blue-700">
        Your order has shipped and is on its way to you.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <p>
        <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
      </p>
      <p>
        <strong>Carrier:</strong> {order.carrier}
      </p>
      <div className="flex items-center gap-4 pt-2">
        <p className="font-semibold">{order.trackingNumber}</p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Track Package
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CancelledInfoCard = ({ order }: { order: any }) => (
  <Card className="bg-red-50 border-red-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-red-900">
        <XCircle /> Order Cancelled
      </CardTitle>
      <CardDescription className="text-red-700">
        This order was cancelled on {order.cancelledDate}.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p>
        <strong>Refund Status:</strong> {order.refundStatus}
      </p>
    </CardContent>
  </Card>
);

const DeliveredInfoCard = ({ order }: { order: any }) => (
  <Card className="bg-green-50 border-green-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-green-900">
        <CheckCircle /> Delivered
      </CardTitle>
      <CardDescription className="text-green-700">
        This order was successfully delivered on {order.deliveredDate}.
      </CardDescription>
    </CardHeader>
  </Card>
);

// --- MAIN ORDER DETAILS PAGE ---
export default function OrderDetailsPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = allOrderDetails.find((o) => o.id === params.orderId);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
        <p className="text-gray-500 mt-2">
          The order ID "{params.orderId}" does not exist.
        </p>
      </div>
    );
  }

  const renderActionButtons = () => {
    switch (order.status) {
      case "Processing":
        return (
          <Button className="w-full h-11 bg-red-600 hover:bg-red-700 text-white">
            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
          </Button>
        );
      case "Shipped":
        return (
          <Button className="w-full h-11 bg-gray-800 hover:bg-gray-900 text-white">
            Return Items
          </Button>
        );
      case "Delivered":
      case "Cancelled":
        return (
          <Button className="w-full h-11 bg-green-500 hover:bg-green-600 text-white">
            <RefreshCw className="mr-2 h-4 w-4" /> Buy Again
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order.id}
          </h1>
          <p className="text-gray-500 mt-1">Placed on {order.date}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {order.status === "Shipped" && <ShippedInfoCard order={order} />}
          {order.status === "Cancelled" && <CancelledInfoCard order={order} />}
          {order.status === "Delivered" && <DeliveredInfoCard order={order} />}

          {order.status !== "Cancelled" && (
            <OrderTracker status={order.status} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Items in Order ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className="flex items-center gap-6 py-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-lg text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">{item.attributes}</p>
                      <p className="text-md text-gray-700 mt-2">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  {index < order.items.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <MapPin className="h-6 w-6 text-gray-500" />
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <CreditCard className="h-6 w-6 text-gray-500" />
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <p className="font-semibold text-gray-800">
                  Paid with {order.payment.method} ending in{" "}
                  {order.payment.last4}
                </p>
                <p>Billing Address: {order.payment.billingAddress}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${order.summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${order.summary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${order.summary.tax.toFixed(2)}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-xl text-gray-900">
                  <span>Total</span>
                  <span>${order.summary.total.toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="pt-2 space-y-3">
                  {renderActionButtons()}
                  <Button className="w-full h-11 bg-gray-200 hover:bg-gray-300 text-gray-800">
                    <FileText className="mr-2 h-4 w-4" /> Get Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
