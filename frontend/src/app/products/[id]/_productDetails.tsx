"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AddToCart } from "@/components/AddToCart";
import { toast } from "sonner";
import {
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Phone,
  Mail,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductWithPopulatedSeller } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface Props {
  product: ProductWithPopulatedSeller;
}

export default function ProductDetails({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { user: loggedInUser } = useAuth();

  const { general, pricing, inventory, specifications, additional, seller } =
    product;
  

  const isSellerProduct = !!(
    product.seller &&
    loggedInUser &&
    product.seller._id === loggedInUser._id
  );

  const currentPrice =
    pricing.salePrice && pricing.salePrice < pricing.price
      ? pricing.salePrice
      : pricing.price;
  const imageUrl = general.images?.[0]
    ? `http://localhost:5000${general.images[0]}`
    : "https://placehold.co/600x600/333333/ffffff?text=No+Image";

  return (
    <>
      <Header />
      <main className="pb-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
                <div className="relative w-96 h-96">
                  {" "}
                  <Image
                    src={imageUrl}
                    alt={general.title}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-3xl shadow-2xl"
                  />
                </div>
              </div>

              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {general.category}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {general.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {general.description}
                </p>

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
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(
                                inventory.quantity,
                                parseInt(e.target.value) || 1
                              )
                            )
                          )
                        }
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
                        product && isWishlisted(product.id)
                          ? "text-red-500 border-red-500"
                          : "hover:text-red-500"
                      }`}
                      onClick={() => {
                        if (!product) return;
                        if (isWishlisted(product.id)) {
                          removeFromWishlist(product.id);
                        } else {
                          addToWishlist({
                            productId: product.id,
                            name: product.general.title,
                            price: currentPrice,
                            image: imageUrl,
                            category: product.general.category,
                          });
                        }
                      }}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          product && isWishlisted(product.id)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 rounded-xl border-2 hover:border-red-500 hover:text-red-500"
                      onClick={() =>
                        toast.info("Share functionality (not implemented yet).")
                      }
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
                  isOwnProduct={isSellerProduct}
                />

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RotateCcw className="w-5 h-5 text-orange-500" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                Specifications
              </h2>
              <dl className="space-y-4">
                {specifications.customSpecs &&
                specifications.customSpecs.length > 0 ? (
                  specifications.customSpecs.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <dt className="font-medium text-gray-700">
                        {spec.label}
                      </dt>
                      <dd className="text-gray-900 font-semibold">
                        {String(spec.value)}
                      </dd>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}
              </dl>
            </div>

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
                      {(seller.firstName?.charAt(0) || "") +
                        (seller.lastName?.charAt(0) || "") || "S"}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {seller.firstName} {seller.lastName}
                    </h3>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Seller Information
                </h2>
                <p className="text-gray-600">
                  Seller details are not available.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
