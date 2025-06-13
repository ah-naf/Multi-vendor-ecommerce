// Based on backend/models/Product.js

// Sub-schema for custom specs if needed on frontend, otherwise can be generic object/any
export interface CustomSpec {
  id: string;
  label: string;
  value: string;
  type: string; // e.g., 'text', 'number', 'boolean'
}

export interface Product {
  _id?: string; // MongoDB default ID, optional on frontend if not always sent/used
  id: string; // Custom, unique string ID (as defined in schema)
  general: {
    title: string;
    description: string;
    images: string[]; // Array of image URLs/paths
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
  seller: string; // Seller ID (reference to User model)
  createdAt?: string; // Timestamps
  updatedAt?: string; // Timestamps
}

// Cart Item Type - based on backend/models/User.js CartItemSchema
export interface CartItem {
  productId: string; // References Product._id or Product.id depending on backend setup
  name: string;
  attributes?: string; // Optional attributes like size, color
  price: number;
  quantity: number;
  image?: string;
  addedAt?: string | Date; // ISO string or Date object
}

// Wishlist Item Type - based on backend/models/User.js WishlistItemSchema
export interface WishlistItem {
  productId: string; // References Product._id or Product.id
  name: string;
  attributes?: string; // Optional attributes like size, color
  price: number;
  image?: string;
  addedAt?: string | Date; // ISO string or Date object
  category: string;
}

// Simplified Product Summary for listings or quick views
export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

// User Address Type - based on backend/models/User.js AddressSchema
export interface Address {
  _id?: string; // Subdocument ID from Mongoose
  type: string; // e.g., 'Home', 'Work'
  addressLine1: string; // Main address line
  addressLine2?: string; // Secondary address line (optional)
  city: string; // City name
  state: string; // State/Province
  zipCode: string; // Zip/Postal code
  country: string; // Country name
  isDefault: boolean;
}

// User Profile Data Type
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
  // We don't include password here
  // Other fields like cart, wishlist, orders are likely handled by their own services/types
}

// For updating profile - not all fields are required
export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
}

// For adding/updating address - not all fields are required for update
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
