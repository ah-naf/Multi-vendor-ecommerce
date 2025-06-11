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
