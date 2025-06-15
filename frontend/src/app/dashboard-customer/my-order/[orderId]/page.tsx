"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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
  MapPin,
  CreditCard,
  RefreshCw,
  FileText,
  XCircle,
  Truck,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Timeline from "@/components/orders/Timeline";
import { useAuth } from "@/context/AuthContext";
import { getBackendBaseUrl } from "@/services/productService";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderDetail } from "@/types";

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    Delivered: "bg-green-100 text-green-800 border-green-300",
    Shipped: "bg-blue-100 text-blue-800 border-blue-300",
    Processing: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Packed: "bg-sky-100 text-sky-800 border-sky-300",
    "Out for Delivery": "bg-indigo-100 text-indigo-800 border-indigo-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
    default: "bg-gray-100 text-gray-800 border-gray-300",
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

const ShippedInfoCard = ({ order }: { order: OrderDetail }) => (
  <Card className="bg-blue-50 border-blue-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-blue-900">
        <Truck /> On Its Way!
      </CardTitle>
      <CardDescription className="text-blue-700">
        Your order was shipped{" "}
        {order.estimatedShipDate
          ? `on ${new Date(order.estimatedShipDate).toLocaleDateString()}`
          : "and is currently in transit"}
        .
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {order.estimatedDelivery && (
        <p>
          <strong>Estimated Delivery:</strong>{" "}
          {new Date(order.estimatedDelivery).toLocaleDateString()}
        </p>
      )}
      {order.carrier && (
        <p>
          <strong>Carrier:</strong> {order.carrier}
        </p>
      )}
      {order.trackingNumber && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pt-2">
          <p className="font-semibold">Tracking: {order.trackingNumber}</p>
          <Button
            onClick={() =>
              toast.info(`Tracking for ${order.trackingNumber} (placeholder).`)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 h-auto"
          >
            Track Package
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

const CancelledInfoCard = ({ order }: { order: OrderDetail }) => (
  <Card className="bg-red-50 border-red-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-red-900">
        <XCircle /> Order Cancelled
      </CardTitle>
      <CardDescription className="text-red-700">
        This order was cancelled on{" "}
        {order.cancelledDate
          ? new Date(order.cancelledDate).toLocaleDateString()
          : new Date(order.date).toLocaleDateString()}
        .
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {order.cancellationReason && (
        <div>
          <p className="font-semibold">
            Cancelled By:{" "}
            <span className="capitalize font-normal">
              {order.cancelledBy || "N/A"}
            </span>
          </p>
          <p className="font-semibold">
            Reason:{" "}
            <span className="font-normal">{order.cancellationReason}</span>
          </p>
        </div>
      )}
      {order.payment?.method && (
        <p className="text-sm text-gray-600 pt-2">
          If applicable, refunds are typically processed to the original payment
          method ({order.payment.method}) within 5-10 business days.
        </p>
      )}
    </CardContent>
  </Card>
);

const DeliveredInfoCard = ({ order }: { order: OrderDetail }) => (
  <Card className="bg-green-50 border-green-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-green-900">
        <CheckCircle /> Delivered
      </CardTitle>
      <CardDescription className="text-green-700">
        This order was successfully delivered on{" "}
        {new Date(order.date).toLocaleDateString()}.
      </CardDescription>
    </CardHeader>
  </Card>
);

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  const [showCustomerCancelDialog, setShowCustomerCancelDialog] =
    useState(false);
  const [customerCancellationReason, setCustomerCancellationReason] =
    useState("");

  const fetchOrderDetails = async () => {
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      toast.error("Order ID is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Order with ID ${orderId} not found.`);
        }
        const errorData = await response.json().catch(() => ({
          message:
            "An unknown server error occurred while fetching order details.",
        }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      const data: OrderDetail = await response.json();
      setOrderDetails(data);
    } catch (err: any) {
      const message = err.message || "Failed to fetch order details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token]);

  const handleConfirmCustomerCancellation = async () => {
    if (!orderDetails || !customerCancellationReason.trim()) {
      toast.error("Cancellation reason cannot be empty.");
      return;
    }
    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/${
          orderDetails.id
        }/cancel-by-customer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cancellationReason: customerCancellationReason,
          }),
        }
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to request cancellation."
        );
      }
      toast.success("Order cancellation requested successfully.");
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.message || "Error requesting cancellation.");
    } finally {
      setShowCustomerCancelDialog(false);
      setCustomerCancellationReason("");
    }
  };

  const order = orderDetails;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-bold text-red-700 mt-4">
          Error Fetching Order
        </h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <Button
          onClick={() => router.push("/dashboard-customer/my-order")}
          className="mt-6"
        >
          Back to My Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-700 mt-4">
          Order Not Found
        </h1>
        <p className="text-gray-500 mt-2">
          We couldn't find details for order ID "{orderId}". It might have been
          removed or the ID is incorrect.
        </p>
        <Button
          onClick={() => router.push("/dashboard-customer/my-order")}
          className="mt-6"
        >
          View All Orders
        </Button>
      </div>
    );
  }

  const renderActionButtons = () => {
    const currentStatus = order.status;

    switch (currentStatus) {
      case "Processing":
        return (
          <Button
            onClick={() => {
              setCustomerCancellationReason("");
              setShowCustomerCancelDialog(true);
            }}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="mr-2 h-4 w-4" /> Request Cancellation
          </Button>
        );
      case "Shipped":
      case "Delivered":
        return (
          <>
            <Button
              onClick={() =>
                toast.info(
                  `Adding items from order ${order.id} to cart... (Placeholder)`
                )
              }
              className="w-full h-11 bg-green-500 hover:bg-green-600 text-white mt-3"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Buy Again
            </Button>
          </>
        );
      case "Cancelled":
        return (
          <Button
            onClick={() =>
              toast.info(
                `Adding items from order ${order.id} to cart... (Placeholder)`
              )
            }
            className="w-full h-11 bg-green-500 hover:bg-green-600 text-white"
          >
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
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {order.status === "Shipped" && order.trackingNumber && (
            <ShippedInfoCard order={order} />
          )}
          {order.status === "Cancelled" && <CancelledInfoCard order={order} />}
          {order.status === "Delivered" &&
            (order.deliveredDate || order.estimatedDelivery) && (
              <DeliveredInfoCard order={order} />
            )}

          <Timeline
            status={order.status}
            orderDate={order.date}
            shippedDate={order.estimatedShipDate}
            deliveredDate={order.deliveredDate}
            cancelledDate={order.cancelledDate}
          />

          <Card>
            <CardHeader>
              <CardTitle>Items in Order ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items.map((item, index) => (
                <React.Fragment key={item.id + "-" + index}>
                  {" "}
                  <div className="flex items-center gap-6 py-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={`${getBackendBaseUrl()}${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-lg text-gray-900">
                        {item.name}
                      </p>
                      {item.attributes && (
                        <p className="text-sm text-gray-500">
                          {item.attributes}
                        </p>
                      )}
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
              <CardContent className="text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <CreditCard className="h-6 w-6 text-gray-500" />
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">
                  Paid with {order.payment.method}
                  {order.payment.last4
                    ? ` ending in ${order.payment.last4}`
                    : ""}
                </p>
                <p>Billing Address: {order.payment.billingAddress}</p>
                <p>Country: {order.payment.country}</p>
                <p>Phone: {order.payment.phone}</p>
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
                  <Button
                    onClick={() =>
                      toast.info("Invoice generation/download placeholder.")
                    }
                    className="w-full h-11 bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Get Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {orderDetails && (
        <Dialog
          open={showCustomerCancelDialog}
          onOpenChange={setShowCustomerCancelDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Order Cancellation</DialogTitle>
              <CardDescription className="pt-2">
                Order ID: {orderDetails.id} <br />
                Please provide a reason for your cancellation request. This
                action may not be reversible if the order has already been
                processed.
              </CardDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <label
                htmlFor="customerCancellationReason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                id="customerCancellationReason"
                value={customerCancellationReason}
                onChange={(e) => setCustomerCancellationReason(e.target.value)}
                placeholder="e.g., Accidental order, changed my mind..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                rows={4}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCustomerCancelDialog(false)}
                className="sm:order-1"
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCustomerCancellation}
                disabled={!customerCancellationReason.trim()}
                className="sm:order-2 bg-red-600 hover:bg-red-700"
              >
                Confirm Cancellation Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
