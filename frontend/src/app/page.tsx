"use client";

import React, { useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation"; // Added useRouter
import { useAuth } from "@/context/AuthContext"; // Added useAuth
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const products = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    category: "Audio",
    price: 249.99,
    image: "/placeholder-image.svg",
  },
  {
    id: 3,
    name: "Ultra-Thin Laptop with High-Resolution Display",
    category: "Laptops",
    price: 1299.0,
    image: "/placeholder-image.svg",
  },
  {
    id: 5,
    name: "Professional DSLR Camera",
    category: "Cameras",
    price: 1999.99,
    image: "/placeholder-image.svg",
  },
  {
    id: 8,
    name: "4K UHD Gaming Monitor",
    category: "Monitors",
    price: 599.0,
    image: "/placeholder-image.svg",
  },
  {
    id: 7,
    name: "Retro Mechanical Keyboard",
    category: "Keyboards",
    price: 189.5,
    image: "/placeholder-image.svg",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    category: "Wearables",
    price: 199.5,
    image: "/placeholder-image.svg",
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 79.99,
    image: "/placeholder-image.svg",
  },
  {
    id: 6,
    name: "Smart Home Hub",
    category: "Smart Home",
    price: 129.0,
    image: "/placeholder-image.svg",
  },
];

// --- MAIN HOMEPAGE COMPONENT ---
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Show loading indicator or null while redirecting
    // Or a more sophisticated full-page loader
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading...</div>
      </div>
    );
  }

  // This part will ideally not be reached if redirection logic is correct
  // and user is always redirected. However, it's a fallback.
  // Or, you might want to show this page briefly if user is logged in
  // and then redirect. For now, we assume immediate redirection.
  // If the user is logged in and role-based redirect hasn't happened yet,
  // this content might flash briefly.
  // To prevent flashing, ensure the redirect logic in useEffect is robust
  // and the loading state correctly covers the period before redirection.

  return (
    // The actual homepage content, which will be shown only if not loading and user exists
    // (though current logic redirects away if user exists)
    // This might be shown if there's a delay in redirection or if you decide to show
    // the homepage to logged-in users before they navigate to their dashboard.
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Products For You
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
            Discover our curated selection of high-quality electronics.
          </p>
        </div>

        {/* --- PRODUCT GRID WITH SHADCN CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <Link href="#" passHref>
                <div className="overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                </div>
              </Link>

              <CardContent className="p-4 bg-white">
                <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                <h3
                  className="font-semibold text-lg text-gray-800 h-14 truncate"
                  title={product.name}
                >
                  {product.name}
                </h3>
                <p className="text-xl font-bold text-gray-900 mt-2 mb-4">
                  ${product.price.toFixed(2)}
                </p>

                {/* --- ACTION BUTTONS --- */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => alert(`${product.name} added to wishlist!`)}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    className="flex-grow bg-red-500 text-white hover:bg-red-500/90"
                    onClick={() => alert(`${product.name} added to cart!`)}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
