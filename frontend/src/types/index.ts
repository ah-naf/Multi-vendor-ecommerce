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
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
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
