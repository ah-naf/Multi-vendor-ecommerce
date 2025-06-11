// app/products/[id]/page.tsx

import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AddToCart } from "@/components/AddToCart";
import {
  Star,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const products = [
  {
    id: "prod_1",
    general: {
      title: "iPhone 15 Pro",
      description:
        "The latest and greatest from Apple, featuring the A17 Bionic chip and a stunning ProMotion display.",
      images: ["https://placehold.co/600x600/333333/ffffff?text=iPhone+15"],
      category: "Mobile Phones",
    },
    specifications: {
      customSpecs: [
        { id: "spec_1", label: "Brand", value: "Apple", type: "text" },
        { id: "spec_2", label: "Model", value: "iPhone 15 Pro", type: "text" },
        { id: "spec_3", label: "Storage (GB)", value: "256", type: "number" },
        {
          id: "spec_4",
          label: "Warranty End Date",
          value: "2025-12-31",
          type: "date",
        },
        { id: "spec_5", label: "Color", value: "Titanium Black", type: "text" },
        {
          id: "spec_6",
          label: "Condition Notes",
          value: "Brand new, sealed in box.",
          type: "textarea",
        },
      ],
    },
    pricing: { price: 1099, salePrice: 1050, enableNegotiation: false },
    inventory: { quantity: 150, sku: "APL-15P-TB-256" },
    additional: { tags: "apple, iphone, smartphone, 5g" },
    seo: {
      title: "Buy iPhone 15 Pro - 256GB Titanium Black",
      description:
        "Get the best deal on the new Apple iPhone 15 Pro. Unlocked, 256GB storage, in Titanium Black.",
    },
    seller: {
      name: "John's Phone Store",
      email: "contact@phoneshop.com",
      phone: "+1 (555) 999-1234",
    },
    rating: 4.8,
    reviewCount: 124,
  },
];

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seo.title,
    description: product.seo.description,
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();

  const { general, pricing, inventory, specifications, additional, seller } =
    product;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-200 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

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
                <div className="relative">
                  <div className="w-96 h-96 bg-gradient-to-br from-gray-800 to-black rounded-3xl flex items-center justify-center text-white text-xl font-medium shadow-2xl">
                    iPhone 15 Pro
                  </div>
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    New
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {general.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                    <span className="text-sm text-gray-600 ml-2">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {general.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {general.description}
                </p>

                {/* Pricing */}
                <div className="flex items-baseline gap-4 mb-8">
                  {pricing.salePrice ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        ${pricing.salePrice}
                      </span>
                      <span className="text-2xl text-gray-400 line-through">
                        ${pricing.price}
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Save ${pricing.price - pricing.salePrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">
                      ${pricing.price}
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
                        defaultValue={1}
                        min={1}
                        max={inventory.quantity}
                        className="w-20 h-12 border-2 border-gray-200 rounded-xl px-3 text-center font-semibold focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 rounded-xl border-2 hover:border-red-500 hover:text-red-500"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 rounded-xl border-2 hover:border-red-500 hover:text-red-500"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <AddToCart productId={product.id} maxQty={inventory.quantity} />

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span>Free Delivery</span>
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
                {specifications.customSpecs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <dt className="font-medium text-gray-700">{spec.label}</dt>
                    <dd className="text-gray-900 font-semibold">
                      {spec.value}
                    </dd>
                  </div>
                ))}
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
                    {inventory.sku}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">
                    Availability
                  </span>
                  <span className="text-green-600 font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {inventory.quantity} in stock
                  </span>
                </div>
                <div className="pt-4">
                  <h3 className="font-medium text-gray-700 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {additional.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-700 px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info Card */}
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
                    {seller.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {seller.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {renderStars(4.9)}
                    <span className="text-sm text-gray-600 ml-1">(4.9)</span>
                  </div>
                </div>

                <div className="space-y-3">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
