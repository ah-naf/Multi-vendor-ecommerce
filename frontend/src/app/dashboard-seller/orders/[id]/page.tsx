// File: src/app/dashboard-seller/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Phone,
  // CheckCircle, // Replaced by more specific icons in Timeline or StatusBadge
  // Clock, // Replaced by more specific icons in Timeline or StatusBadge
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
  Loader2, // Added Loader
  Package, // For item details
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Added DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // For update dialog
import { Label } from "@/components/ui/label"; // For update dialog
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For status dropdown
// import ordersData from "@/data/orders.json"; // Mock data removed
import Timeline from "@/components/orders/Timeline"; // Assuming this component can adapt or will be reviewed
import { toast } from "sonner";
import { getBackendBaseUrl } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";

// --- TYPE DEFINITIONS (align with backend OrderDetail model) ---
interface OrderItem {
  id: string; // Product ID
  name: string;
  quantity: number;
  price: number;
  image?: string;
  attributes?: string;
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

interface PaymentDetails {
  // Simplified based on what's shown in mock, but should align with backend
  method: string;
  last4?: string;
  billingAddress?: string; // May not be directly on payment object from backend
  // Backend might have more structured payment details if needed
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number; // Mock had discount, if backend provides it
}

interface Order {
  id: string; // Order UUID
  date: string; // ISO String date
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: PaymentDetails; // This was order.buyer.paymentMethod in mock
  summary: OrderSummary; // This was order.paymentInfo in mock

  // Optional fields from backend OrderDetail model for shipping
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  estimatedShipDate?: string;
  deliveredDate?: string; // Added
  cancelledDate?: string; // Added
  cancellationReason?: string; // Added
  cancelledBy?: 'seller' | 'customer' | 'admin' | 'system' | null; // Added

  // Optional: If backend provides buyer user details directly
  user?: {
    id?: string;
    email?: string; // Mock had order.buyer.email
    // other user fields if necessary
  };
}

// For the update dialog form
interface UpdateFormData {
  status: string;
  trackingNumber: string;
  carrier: string;
  estimatedShipDate: string;
  estimatedDelivery: string;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id; // Extracted for clarity

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
    status: "",
    trackingNumber: "",
    carrier: "",
    estimatedShipDate: "",
    estimatedDelivery: "",
  });
  const { token } = useAuth();

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError("Order ID not found in URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/seller-orders/${orderId}`,
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
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to fetch order details." }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      const data: Order = await response.json();
      setOrder(data);
      // Pre-fill update form data when order is fetched
      setUpdateFormData({
        status: data.status || "",
        trackingNumber: data.trackingNumber || "",
        carrier: data.carrier || "",
        estimatedShipDate: data.estimatedShipDate
          ? new Date(data.estimatedShipDate).toISOString().split("T")[0]
          : "",
        estimatedDelivery: data.estimatedDelivery
          ? new Date(data.estimatedDelivery).toISOString().split("T")[0]
          : "",
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token]);

  const handleUpdateOrderSubmit = async () => {
    if (!order) return;
    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/seller-orders/${order.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateFormData),
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to update order." }));
        throw new Error(errorData.message || "Failed to update order status.");
      }
      toast.success("Order updated successfully!");
      setShowUpdateDialog(false);
      fetchOrderDetails(); // Re-fetch to get updated details
    } catch (err: any) {
      toast.error(err.message || "Error updating order.");
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    try {
      const response = await fetch(
        `${getBackendBaseUrl()}/api/orders/seller-orders/${order.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Cancelled", cancellationReason }), // Include reason if backend supports it
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to cancel order." }));
        throw new Error(errorData.message || "Failed to cancel order.");
      }
      toast.success("Order cancelled successfully!");
      setShowCancelDialog(false);
      setCancellationReason(""); // Reset reason
      fetchOrderDetails(); // Re-fetch
    } catch (err: any) {
      toast.error(err.message || "Error cancelling order.");
    }
  };

  const handleUpdateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setUpdateFormData({ ...updateFormData, status: value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-700">
          Error Fetching Order
        </h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button
          onClick={() => router.push("/dashboard-seller/orders")}
          className="mt-4"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    // This case might be covered by error state if 404 is thrown, but as a fallback:
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">Order Not Found</h2>
        <p className="mt-2 text-gray-500">
          The requested order could not be found.
        </p>
        <Button
          onClick={() => router.push("/dashboard-seller/orders")}
          className="mt-4"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  // Assuming only one item is primarily displayed in summary, or loop if needed
  const firstItem =
    order.items && order.items.length > 0 ? order.items[0] : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard-seller/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              toast.info("Print invoice functionality placeholder.")
            }
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button
            size="lg"
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
            onClick={() =>
              toast.info(
                `Contacting buyer at ${order.shippingAddress.phone} (placeholder).`
              )
            }
          >
            <Phone className="mr-2 h-4 w-4" />
            Contact Buyer
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border rounded-lg p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          {firstItem && (
            <img
              src={`${getBackendBaseUrl()}${firstItem.image}`}
              alt={firstItem.name}
              className="h-36 w-36 md:h-28 md:w-28 object-cover rounded mr-6"
            />
          )}
          {!firstItem && (
            <div className="h-20 w-20 bg-gray-200 rounded mr-6 flex items-center justify-center">
              <Package />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">
              {firstItem ? firstItem.name : "N/A"}
            </h3>
            <span className="text-sm">{firstItem?.attributes}</span>
            <div className="grid mt-2 grid-cols-2 md:grid-cols-5 gap-4 md:gap-x-8 text-sm text-gray-600">
              <div className="col-span-2">
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
              {firstItem && (
                <>
                  <div>
                    <div className="font-medium text-gray-700">Quantity</div>
                    <div>{firstItem.quantity} (for first item)</div>
                  </div>
                  {firstItem.attributes && (
                    <div>
                      <div className="font-medium text-gray-700">Details</div>
                      <div>{firstItem.attributes}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <Badge
          variant={
            order.status === "Processing"
              ? "warning"
              : order.status === "Packed"
              ? "info"
              : order.status === "Shipped"
              ? "primary"
              : order.status === "Out for Delivery"
              ? "secondary"
              : order.status === "Delivered"
              ? "success"
              : order.status === "Cancelled"
              ? "destructive"
              : "default"
          }
          className="mt-4 md:mt-0 capitalize"
        >
          {order.status}
        </Badge>
      </div>

      {/* Cancellation Info Display */}
      {order.status === "Cancelled" && order.cancellationReason && (
        <div className="mt-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-md font-semibold text-red-700">Order Cancelled</h4>
          {order.cancelledBy && (
            <p className="text-sm text-red-600">
              Cancelled by: <span className="capitalize">{order.cancelledBy}</span>
            </p>
          )}
          <p className="text-sm text-red-600">
            Reason: {order.cancellationReason}
          </p>
          {order.cancelledDate && (
             <p className="text-sm text-gray-500 mt-1">
               Cancellation Date: {new Date(order.cancelledDate).toLocaleDateString()}
             </p>
          )}
        </div>
      )}

      {/* Timeline | Buyer Info | Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Timeline
          status={order.status}
          orderDate={order.date}
          shippedDate={order.estimatedShipDate} // Prop name updated, using estimatedShipDate as per Order interface
          deliveredDate={order.deliveredDate}   // Prop name updated, using deliveredDate from Order interface
          cancelledDate={order.cancelledDate}   // Added cancelledDate
        />

        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Buyer Information</h4>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-medium">Name</p>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{order.shippingAddress.name}</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>
                  {order.user?.email ||
                    order.shippingAddress.phone ||
                    "Not available"}
                </span>
              </div>
            </div>
            <div>
              <p className="font-medium">Shipping Address</p>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2
                    ? `, ${order.shippingAddress.addressLine2}`
                    : ""}
                  , <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}, <br />
                  {order.shippingAddress.country}
                </span>
              </div>
            </div>
            <div>
              <p className="font-medium">Payment Method</p>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span>
                  {order.payment.method}{" "}
                  {order.payment.last4 ? `•••• ${order.payment.last4}` : ""}
                  <span className="ml-2 text-green-600 text-xs font-semibold">
                    Paid
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.summary.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.summary.tax.toFixed(2)}</span>
            </div>
            {order.summary.discount && order.summary.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-${order.summary.discount.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${order.summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => setShowCancelDialog(true)}
          disabled={["Shipped", "Delivered", "Cancelled"].includes(
            order.status
          )}
        >
          Cancel Order
        </Button>
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700" // Changed color for update
          onClick={() => {
            setUpdateFormData({
              // Pre-fill form
              status: order.status,
              trackingNumber: order.trackingNumber || "",
              carrier: order.carrier || "",
              estimatedShipDate: order.estimatedShipDate
                ? new Date(order.estimatedShipDate).toISOString().split("T")[0]
                : "",
              estimatedDelivery: order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toISOString().split("T")[0]
                : "",
            });
            setShowUpdateDialog(true);
          }}
          disabled={["Delivered", "Cancelled"].includes(order.status)}
        >
          Update Order / Shipping
        </Button>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              {" "}
              <AlertTriangle className="h-6 w-6 text-red-500" />{" "}
              <DialogTitle>Cancel Order #{order.id}?</DialogTitle>{" "}
            </div>
            <DialogDescription className="mt-1">
              {" "}
              Are you sure you want to cancel this order? This action cannot be
              undone and the buyer will be notified.{" "}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="cancellationReason"
                className="block text-sm font-medium text-gray-700"
              >
                {" "}
                Reason for cancellation <span className="text-red-500">
                  *
                </span>{" "}
              </Label>
              <Textarea
                id="cancellationReason"
                placeholder="e.g., Item out of stock, Buyer requested cancellation"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              {" "}
              Keep Order{" "}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmCancel}
              disabled={!cancellationReason.trim()}
            >
              {" "}
              Confirm Cancellation{" "}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog (Simplified) */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Order #{order.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                name="status"
                value={updateFormData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  {/* <SelectItem value="Cancelled">Cancelled</SelectItem> Should be done via Cancel Order dialog */}
                </SelectContent>
              </Select>
            </div>
            {updateFormData.status === "Shipped" ||
            updateFormData.status === "Delivered" ? ( // Show only if status is Shipped or Delivered
              <>
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    name="trackingNumber"
                    value={updateFormData.trackingNumber}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrier">Carrier</Label>
                  <Input
                    id="carrier"
                    name="carrier"
                    value={updateFormData.carrier}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedShipDate">Est. Ship Date</Label>
                  <Input
                    id="estimatedShipDate"
                    name="estimatedShipDate"
                    type="date"
                    value={updateFormData.estimatedShipDate}
                    onChange={handleUpdateFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Est. Delivery Date</Label>
                  <Input
                    id="estimatedDelivery"
                    name="estimatedDelivery"
                    type="date"
                    value={updateFormData.estimatedDelivery}
                    onChange={handleUpdateFormChange}
                  />
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
            >
              Close
            </Button>
            <Button onClick={handleUpdateOrderSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
