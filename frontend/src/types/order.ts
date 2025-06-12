// frontend/src/types/order.ts

export interface OrderItem {
  id: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  image?: string;
  attributes?: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaymentInfo { // As stored in OrderDetail
  method: string;
  last4: string;
  billingAddress: string;
  transactionId?: string | { // Could be populated with Transaction object
      id: string;
      status: string;
      amount: number;
      date: string;
      paymentGatewayTransactionId?: string;
  };
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface Order {
  _id: string; // MongoDB ObjectId
  id: string; // Custom Order ID like ORD-XXXXXX
  userId: string;
  date: string; // Should be Date type, but often stringified
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
  summary: OrderSummary;
  trackingNumber?: string;
  carrier?: string;
  deliveredDate?: string;
  cancelledDate?: string;
  createdAt: string;
  updatedAt: string;
}

// For creating an order (subset of Order, specific to what client sends)
export interface OrderCreationData {
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: { // Payment details required for creating an order
      method: string;
      last4: string;
      billingAddress: string;
      clientTransactionId: string; // ID of the transaction document from processPayment call
  };
  summary: OrderSummary;
}

// For processing payment
export interface PaymentProcessingData {
  userId: string;
  amount: number;
  paymentMethodData: object; // e.g., {cardNumber: "...", expiry: "...", cvv: "..."}
}

export interface Transaction {
    _id: string;
    id: string; // The unique string ID we generated (uuid)
    userId: string;
    orderId?: string; // ObjectId of the order
    amount: number;
    date: string;
    status: 'Paid' | 'Pending' | 'Failed';
    paymentGatewayTransactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentResponse {
    message: string;
    transaction: Transaction;
}
