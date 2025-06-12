// frontend/src/app/dashboard-customer/makepayment/page.tsx
"use client";

import React, { useState, useContext } from "react"; // Added useContext
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { processPayment, createOrder } from "@/services/orderService";
import type {
    PaymentProcessingData,
    OrderCreationData,
    PaymentResponse,
    Order as OrderType,
    OrderItem,
    ShippingAddress,
    OrderSummary,
    PaymentDetails
} from "@/types/order";
import { AuthContext } from "@/context/AuthContext";


const MakePaymentPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const authContext = useContext(AuthContext);
  // Fallback for simulation if context is not set up or user is null.
  // Backend controllers (PaymentController, OrderController) expect userId in request body.
  const userIdFromAuth = authContext?.user?.id || "mockUserId-from-makepayment-page";

  const handleSimulatePlaceOrder = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setError(null);

    // 1. Mock Payment Data
    const paymentData: PaymentProcessingData = {
      userId: userIdFromAuth,
      amount: 165.50, // Example amount, not 999 to ensure success by default
      paymentMethodData: {
        type: "SimulatedCard",
        details: "Mock card ending 4242, processed for simulation.",
      },
    };

    try {
      // 2. Process Payment
      setStatusMessage("Processing payment...");
      const paymentResponse: PaymentResponse = await processPayment(paymentData);
      setStatusMessage(`Payment attempt: ${paymentResponse.message}. Transaction ID: ${paymentResponse.transaction.id}, Status: ${paymentResponse.transaction.status}`);

      if (paymentResponse.transaction && paymentResponse.transaction.status === 'Paid') {
        setStatusMessage("Payment successful. Creating order...");
        // 3. Mock Order Data if Payment Succeeded
        const mockItems: OrderItem[] = [
          { id: "prod_mock_001", name: "Futuristic Gadget X", price: 99.99, quantity: 1, image: "/images/mock-gadget.png", attributes: "Color: Nebula Blue" },
          { id: "prod_mock_002", name: "Anti-Gravity Pen", price: 49.99, quantity: 1, image: "/images/mock-pen.png" },
        ];
        const mockShippingAddress: ShippingAddress = {
          name: authContext?.user?.name || "Test User", // Use from auth if available
          address: "123 Simulation Avenue",
          city: "Testville",
          state: "TS",
          zip: "00000",
        };
        const mockSummary: OrderSummary = {
          subtotal: mockItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          shipping: 10.00,
          tax: 5.52, // Example tax
          total: paymentData.amount, // Ensure total matches payment amount
        };
         // Ensure subtotal + shipping + tax = total for consistency, adjust tax or shipping if needed
        mockSummary.subtotal = parseFloat(mockSummary.subtotal.toFixed(2));
        mockSummary.tax = parseFloat((paymentData.amount - mockSummary.subtotal - mockSummary.shipping).toFixed(2));


        const paymentDetailsForOrder: PaymentDetails = {
            method: "SimulatedCard",
            last4: "4242",
            billingAddress: "123 Simulation Avenue, Testville, TS, 00000",
            clientTransactionId: paymentResponse.transaction.id,
        };

        const orderData: OrderCreationData = {
          userId: userIdFromAuth,
          items: mockItems,
          shippingAddress: mockShippingAddress,
          payment: paymentDetailsForOrder,
          summary: mockSummary,
        };

        // 4. Create Order
        const createdOrder: OrderType = await createOrder(orderData);
        setStatusMessage(
          `Order placed successfully! Order ID: ${createdOrder.id}. Redirecting to order details...`
        );

        setTimeout(() => {
            router.push(`/dashboard-customer/orders/${createdOrder.id}`);
        }, 2500); // Slightly longer delay

      } else {
        setError(`Payment was not successful (Status: ${paymentResponse.transaction.status}). Order not created.`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during the simulation.";
      setError(`Simulation process failed: ${errorMessage}`);
      console.error("Simulation Process Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Simulate Payment & Order Creation</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4 text-gray-700">
          This page allows you to simulate a complete payment and order creation flow using predefined mock data.
          Click the button below to initiate the process.
        </p>
        <p className="mb-1 text-sm text-gray-600">
          User ID for simulation: <span className="font-mono bg-gray-100 p-1 rounded text-xs">{userIdFromAuth}</span>
        </p>
         <p className="mb-4 text-xs text-gray-500">
          (This ID is sourced from your authentication context if logged in, or a fallback mock ID is used.)
        </p>

        <Button
          onClick={handleSimulatePlaceOrder}
          disabled={isLoading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Processing Simulation..." : "Simulate Placing Order & Payment"}
        </Button>

        {isLoading && (
             <div className="mt-6 p-4 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-md">
                <p className="font-semibold">Processing:</p>
                <p>{statusMessage || "Please wait..."}</p>
            </div>
        )}

        {!isLoading && statusMessage && !error && ( // Show status only if not loading and no error
          <div className="mt-6 p-4 bg-green-50 text-green-700 border border-green-300 rounded-md">
            <p className="font-semibold">Success:</p>
            <p>{statusMessage}</p>
          </div>
        )}

        {error && ( // Error always shown if present
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-300 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
       <div className="mt-8 p-6 bg-indigo-50 text-indigo-700 border border-indigo-300 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">How this simulation works:</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li>A mock payment request is initiated with a predefined amount (e.g., <span className="font-mono bg-gray-200 p-1 rounded text-xs">$${165.50}</span>).</li>
                <li>The backend's `PaymentController` processes this. It's designed to mark payments as 'Paid' unless a specific amount (like 999) is used to simulate failure.</li>
                <li>If the payment is successful ('Paid'):</li>
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
                    <li>A mock order is automatically created with sample items and shipping details.</li>
                    <li>This new order is linked to the successful payment transaction via its ID.</li>
                </ul>
                <li>Upon successful order creation, you will be automatically redirected to the new order's details page.</li>
                <li>To test a payment failure scenario: you can modify the `amount` in this page's code (within `handleSimulatePlaceOrder`) to `999` and click the button again.</li>
            </ol>
        </div>
    </div>
  );
};

export default MakePaymentPage;
