// frontend/src/app/dashboard-customer/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrderDetails } from "@/services/orderService";
import type { Order, OrderItem, ShippingAddress, PaymentInfo, OrderSummary } from "@/types/order"; // Using 'type' import
import { ChevronLeft, Package, CreditCard, Home, Hash, Calendar, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react';


const DetailItem: React.FC<{ label: string; value?: string | number | null; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start mb-2">
    {icon && <span className="mr-2 text-gray-600">{icon}</span>}
    <span className="font-semibold text-gray-700 min-w-[120px]">{label}:</span>
    <span className="text-gray-800">{value || "N/A"}</span>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center mb-4">
            {icon && <span className="mr-3 text-primary">{icon}</span>}
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);


const CustomerOrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string | undefined;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          setLoading(true);
          const fetchedOrder = await getOrderDetails(orderId);
          setOrder(fetchedOrder);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch order details.");
          setOrder(null);
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    } else {
        // Handle case where orderId is not present, though Next.js routing should ensure it is
        setError("Order ID not found in URL.");
        setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <RefreshCw className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-4 text-lg text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-xl text-red-600 mb-2">Error loading order details</p>
        <p className="text-md text-red-500 bg-red-50 p-3 rounded-md inline-block mb-6">{error}</p>
        <div>
            <Button onClick={() => router.back()} variant="outline" className="mr-2">
                <ChevronLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
            <Link href="/dashboard-customer/orders" passHref>
              <Button>
                <Package className="h-4 w-4 mr-2" /> View All Orders
              </Button>
            </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10 text-center">
         <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-xl text-gray-500">Order not found.</p>
         <Link href="/dashboard-customer/orders" passHref>
              <Button variant="outline" className="mt-4">
                <Package className="h-4 w-4 mr-2" /> View All Orders
              </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Order Details</h1>
        <Link href="/dashboard-customer/orders" passHref>
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Orders
          </Button>
        </Link>
      </div>

      <SectionCard title="Order Information" icon={<Hash className="h-6 w-6"/>} >
        <DetailItem label="Order ID" value={order.id} />
        <DetailItem label="Date" value={new Date(order.date).toLocaleDateString()} />
        <DetailItem label="Status" value={order.status} />
        {order.trackingNumber && <DetailItem label="Tracking #" value={order.trackingNumber} />}
        {order.carrier && <DetailItem label="Carrier" value={order.carrier} />}
      </SectionCard>

      <SectionCard title="Items Ordered" icon={<ShoppingCart className="h-6 w-6"/>}>
        {order.items.map((item: OrderItem) => (
          <div key={item.id} className="flex items-center mb-4 pb-4 border-b last:border-b-0 last:pb-0">
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-md object-cover mr-4"
              />
            )}
            <div className="flex-grow">
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              {item.attributes && <p className="text-sm text-gray-500">Attributes: {item.attributes}</p>}
            </div>
            <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Shipping Address" icon={<Home className="h-6 w-6"/>}>
            <p className="text-gray-800 font-medium">{order.shippingAddress.name}</p>
            <p className="text-gray-700">{order.shippingAddress.address}</p>
            <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
        </SectionCard>

        <SectionCard title="Payment Information" icon={<CreditCard className="h-6 w-6"/>}>
            <DetailItem label="Method" value={order.payment.method} />
            {order.payment.last4 && <DetailItem label="Card" value={`**** **** **** ${order.payment.last4}`} />}
            <DetailItem label="Billing Address" value={order.payment.billingAddress} />
            {order.payment.transactionId && typeof order.payment.transactionId !== 'string' && (
                 <DetailItem label="Transaction Status" value={order.payment.transactionId.status} />
            )}
        </SectionCard>
      </div>

      <SectionCard title="Order Summary">
        <DetailItem label="Subtotal" value={`$${order.summary.subtotal.toFixed(2)}`} />
        <DetailItem label="Shipping" value={`$${order.summary.shipping.toFixed(2)}`} />
        <DetailItem label="Tax" value={`$${order.summary.tax.toFixed(2)}`} />
        <hr className="my-2"/>
        <DetailItem label="Total" value={`$${order.summary.total.toFixed(2)}`} icon={<Package className="h-5 w-5" />} />
      </SectionCard>
    </div>
  );
};

export default CustomerOrderDetailsPage;
