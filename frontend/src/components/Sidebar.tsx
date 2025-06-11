// File Path: src/components/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  Box,
  ShoppingBag,
  CreditCard,
  Settings,
  Truck,
  Heart,
  User,
  ShoppingCart,
} from "lucide-react";
import React from "react";

// Reusable NavLink component for sidebar items
const NavLink = ({ href = "/", icon: Icon, children }) => {
  const pathname = usePathname();
  const splittedPath = pathname.split("/");
  const splittedHref = href.split("/");
  const isActive =
    (pathname === "/dashboard-customer" && href == "/dashboard-customer") ||
    (pathname === "/dashboard-seller" && href == "/dashboard-seller") ||
    (splittedPath.length > 2 && splittedPath[2] === splittedHref[2]);

  return (
    <a
      href={href}
      className={`flex items-center p-3 rounded-lg font-semibold transition-colors ${
        isActive ? "bg-red-100 text-red-600" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
      <span className="lg:inline-block md:hidden hidden">{children}</span>
    </a>
  );
};

// Main Sidebar Component
export const Sidebar = ({ isCustomer = false }) => (
  <aside className="hidden md:flex md:w-20 lg:w-64 bg-white border-r border-gray-200 p-4 flex-col justify-between flex-shrink-0">
    <div>
      <div
        className="mb-8 px-2 lg:px-4 h-8 cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <h1 className="text-2xl font-bold text-gray-800 lg:inline-block md:hidden hidden">
          Logo
        </h1>
        <h1 className="text-2xl font-bold text-gray-800 md:inline-block lg:hidden text-center">
          L
        </h1>
      </div>
      <div>
        {!isCustomer && (
          <NavLink href="/dashboard-seller" icon={Home}>
            Seller Overview
          </NavLink>
        )}
        <NavLink href="/dashboard-customer" icon={Home}>
          Customer Overview
        </NavLink>
        {!isCustomer && (
          <>
            <NavLink href="/dashboard-seller/products" icon={Box}>
              Products
            </NavLink>
            <NavLink href="/dashboard-seller/orders" icon={ShoppingBag}>
              Orders
            </NavLink>
            <NavLink href="/dashboard-seller/payments" icon={CreditCard}>
              Payments
            </NavLink>
          </>
        )}

        <NavLink href="/dashboard-customer/my-order" icon={Truck}>
          My Order
        </NavLink>
        <NavLink href="/dashboard-customer/wishlist" icon={Heart}>
          Wishlist
        </NavLink>
        <NavLink href="/dashboard-customer/cart" icon={ShoppingCart}>
          Cart
        </NavLink>
        <NavLink href="/dashboard-customer/profile" icon={User}>
          Profile
        </NavLink>
      </div>
    </div>
  </aside>
);
