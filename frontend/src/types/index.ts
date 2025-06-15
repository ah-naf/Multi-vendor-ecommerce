export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  avatar?: string;
  initials?: string;
  name?: string;
}

interface PopulatedSeller
  extends Omit<
    User,
    "_id" | "password" | "addresses" | "cart" | "wishlist" | "roles"
  > {
  _id: string;
}

export interface ProductWithPopulatedSeller extends Omit<Product, "seller"> {
  seller: PopulatedSeller | null;
}

export interface Withdraw {
  id: string;
  date: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
}

export interface PaymentMethod {
  id: string;
  type: "Bank Transfer" | "PayPal" | "Credit Card" | "Stripe";
  label: string;
  details: Record<string, string>;
}
export interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface SellerOrder {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
  summary: OrderSummary;

  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  estimatedShipDate?: string;
  deliveredDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  cancelledBy?: "seller" | "customer" | "admin" | "system" | null;

  user?: {
    id?: string;
    email?: string;
  };
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
}

export interface RecentOrderData {
  id: string;
  date: string;
  summary: { total: number };
  status: string;
}

export interface ActiveOrderData {
  id: string;
  status: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  attributes?: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  items: OrderItem[];
  cancellationReason?: string;
  cancelledBy?: "seller" | "customer" | "admin" | "system" | null;
  cancelledDate?: string;
  deliveredDate?: string;
}

export interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface PaymentDetails {
  method: string;
  last4: string;
  billingAddress: string;
  country: string;
  phone: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderDetail {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
  summary: OrderSummary;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  estimatedShipDate?: string;
  deliveredDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  cancelledBy?: "seller" | "customer" | "admin" | "system" | null;
}

export interface CustomSpec {
  id: string;
  label: string;
  value: string;
  type: string;
}

export interface Product {
  _id?: string;
  id: string;
  general: {
    title: string;
    description: string;
    images: string[];
    category: string;
  };
  specifications: {
    customSpecs: CustomSpec[];
  };
  pricing: {
    price: number;
    salePrice?: number | null;
    enableNegotiation: boolean;
  };
  inventory: {
    quantity: number;
    sku: string;
  };
  additional: {
    tags?: string;
  };
  seo: {
    title: string;
    description: string;
  };
  seller: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  attributes?: string;
  price: number;
  quantity: number;
  image?: string;
  addedAt?: string | Date;
}

export interface WishlistItem {
  productId: string;
  name: string;
  attributes?: string;
  price: number;
  image?: string;
  addedAt?: string | Date;
  category: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface Address {
  _id: string;
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  isAdmin: boolean;
  addresses: Address[];
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
}

export interface AddressData {
  _id?: string;
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: string[];
}

export interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
      errors?: any;
    };
    status?: number;
  };
}
