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
  id: string;    // Custom, unique string ID (as defined in schema)
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
}

// Simplified Product Summary for listings or quick views
export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}
