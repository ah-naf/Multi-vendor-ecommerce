"use client"; // Required for client-side hooks and event handlers

import React, { useEffect, useState } from "react";
import Image from "next/image";
// import { notFound } from "next/navigation"; // Can be used if you want to show a Next.js 404 page
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AddToCart } from "@/components/AddToCart";
import { Product, User } from "@/types"; // Assuming User type is also in types/index.ts
import { toast } from "sonner";
import {
  Star,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Phone,
  Mail,
  // MapPin, // Not used currently
} from "lucide-react";

// Keeping generateMetadata for now, but it won't have access to client-fetched data for dynamic titles.
// A generic title or one based on ID might be shown.
// For fully dynamic titles based on fetched data, document.title would be set in useEffect.
export async function generateMetadata({ params }: { params: { id: string } }) {
  // This function runs at build time or server-side, it won't have the client-fetched product.
  // It's okay to leave it; it might provide a fallback title.
  // Or remove if it causes confusion / doesn't provide value.
  return {
    title: `Product Details - ${params.id}`,
    description: `View details for product ${params.id}`,
  };
}

interface PopulatedSeller extends Omit<User, '_id' | 'password' | 'addresses' | 'cart' | 'wishlist' | 'roles'> {
  // Include fields we expect from backend populate: 'firstName lastName email phone'
  // Adjust if your User type in `frontend/src/types/index.ts` is different
}

interface ProductWithPopulatedSeller extends Omit<Product, 'seller'> {
  seller: PopulatedSeller | null; // Seller can be null if not populated or not found
}


export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<ProductWithPopulatedSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();


  useEffect(() => {
    if (params.id) {
      const fetchProductDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/customer/products/${params.id}`);
          if (!response.ok) {
            if (response.status === 404) {
              setError("Product not found.");
              toast.error("Product not found.");
              // notFound(); // Call Next.js notFound to render 404 page
            } else {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            setProduct(null);
          } else {
            const data: ProductWithPopulatedSeller = await response.json();
            setProduct(data);
            // Dynamically set title after fetching product
            if (data && data.general?.title) {
              document.title = data.general.title;
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
          console.error("Failed to fetch product details:", errorMessage);
          setError("Failed to fetch product details. Please try again later.");
          toast.error("Failed to fetch product details.");
          setProduct(null);
        } finally {
          setLoading(false);
        }
      };
      fetchProductDetails();
    } else {
      setError("Product ID is missing.");
      setLoading(false);
    }
  }, [params.id]);

  const renderStars = (rating: number = 0) => { // Default rating to 0
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-200 text-yellow-400" // For half stars, if logic is added
            : "text-gray-300"
        }`}
      />
    ));
  };


  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-xl text-gray-700">Loading product details...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="text-2xl text-red-600 bg-red-100 p-6 rounded-md shadow-md text-center">
            Error: {error}
          </div>
          <Button onClick={() => window.history.back()} className="mt-6">Go Back</Button>
        </div>
      </>
    );
  }

  if (!product) {
     // This case should ideally be covered by error state (e.g. "Product not found")
     // or if params.id was initially null/undefined.
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-xl text-gray-700">Product data is unavailable.</div>
        </div>
      </>
    );
  }

  const { general, pricing, inventory, specifications, additional, seller } = product;
  const currentPrice = pricing.salePrice && pricing.salePrice < pricing.price ? pricing.salePrice : pricing.price;
  const imageUrl = general.images && general.images.length > 0
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${general.images[0]}`
    : "https://placehold.co/600x600/333333/ffffff?text=No+Image";


  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Product Section */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
                <div className="relative w-96 h-96"> {/* Ensure container has size */}
                  <Image
                    src={imageUrl}
                    alt={general.title}
                    layout="fill" // Use fill to respect parent dimensions
                    objectFit="contain" // Or "cover" depending on desired behavior
                    className="rounded-3xl shadow-2xl"
                  />
                   {/* You can add an overlay like "New" if applicable based on product data */}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {general.category}
                  </span>
                  {/* Placeholder for reviews if not available */}
                  {/* <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.reviewCount} reviews)
                    </span>
                  </div> */}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {general.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {general.description}
                </p>

                {/* Pricing */}
                <div className="flex items-baseline gap-4 mb-8">
                  {pricing.salePrice && pricing.salePrice < pricing.price ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        ${pricing.salePrice.toFixed(2)}
                      </span>
                      <span className="text-2xl text-gray-400 line-through">
                        ${pricing.price.toFixed(2)}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Save ${(pricing.price - pricing.salePrice).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">
                      ${pricing.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="quantity"
                      className="text-gray-700 font-medium"
                    >
                      Qty:
                    </label>
                    <div className="relative">
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(inventory.quantity, parseInt(e.target.value) || 1)))}
                        min={1}
                        max={inventory.quantity}
                        className="w-20 h-12 border-2 border-gray-200 rounded-xl px-3 text-center font-semibold focus:border-red-500 focus:outline-none"
                        disabled={inventory.quantity === 0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className={`h-12 w-12 rounded-xl border-2 hover:border-red-500 ${
                        product && isWishlisted(product.id) ? "text-red-500 border-red-500" : "hover:text-red-500"
                      }`}
                      onClick={() => {
                        if (!product) return;
                        if (isWishlisted(product.id)) {
                          removeFromWishlist(product.id);
                        } else {
                          addToWishlist({
                            id: product.id,
                            _id: product._id,
                            name: product.general.title,
                            price: currentPrice,
                            image: imageUrl,
                            category: product.general.category,
                          });
                        }
                      }}
                    >
                      <Heart className={`w-5 h-5 ${product && isWishlisted(product.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 rounded-xl border-2 hover:border-red-500 hover:text-red-500"
                       onClick={() => toast.info("Share functionality (not implemented yet).")}
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <AddToCart
                  productId={product.id}
                  maxQty={inventory.quantity}
                  currentPrice={currentPrice}
                  productTitle={general.title}
                  productImage={imageUrl}
                  selectedQuantity={quantity}
                />

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span>Fast Delivery</span> {/* Adjusted text slightly */}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RotateCcw className="w-5 h-5 text-orange-500" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Specifications Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                Specifications
              </h2>
              <dl className="space-y-4">
                {specifications.customSpecs && specifications.customSpecs.length > 0 ? (
                  specifications.customSpecs.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <dt className="font-medium text-gray-700">{spec.label}</dt>
                      <dd className="text-gray-900 font-semibold">
                        {String(spec.value)} {/* Ensure value is string */}
                      </dd>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}
              </dl>
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                </div>
                Product Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">SKU</span>
                  <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {inventory.sku || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">
                    Availability
                  </span>
                  {inventory.quantity > 0 ? (
                    <span className="text-green-600 font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {inventory.quantity} in stock
                    </span>
                  ) : (
                     <span className="text-red-600 font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Out of stock
                    </span>
                  )}
                </div>
                {additional?.tags && (
                  <div className="pt-4">
                    <h3 className="font-medium text-gray-700 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {additional.tags.split(",").map((tag) => (
                        <span
                          key={tag.trim()}
                          className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-700 px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info Card */}
            {seller ? (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                  </div>
                  Seller Info
                </h2>
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                      {(seller.firstName?.charAt(0) || '') + (seller.lastName?.charAt(0) || '') || 'S'}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {seller.firstName} {seller.lastName}
                    </h3>
                    {/* Placeholder for seller rating if available */}
                    {/* <div className="flex items-center justify-center gap-1 mt-1">
                      {renderStars(4.9)}
                      <span className="text-sm text-gray-600 ml-1">(4.9)</span>
                    </div> */}
                  </div>

                  <div className="space-y-3">
                    {seller.email && (
                      <a
                        href={`mailto:${seller.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Email</div>
                          <div className="text-sm text-gray-600">
                            {seller.email}
                          </div>
                        </div>
                      </a>
                    )}
                    {seller.phone && (
                      <a
                        href={`tel:${seller.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Phone</div>
                          <div className="text-sm text-gray-600">
                            {seller.phone}
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Seller Information</h2>
                 <p className="text-gray-600">Seller details are not available.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
