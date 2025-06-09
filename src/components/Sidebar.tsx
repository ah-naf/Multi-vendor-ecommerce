// File Path: src/components/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import { Home, Box, ShoppingBag, CreditCard, Settings } from "lucide-react";
import React from "react";

// Reusable NavLink component for sidebar items
const NavLink = ({ href, icon: Icon, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

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
export const Sidebar = () => (
  <aside className="hidden md:flex md:w-20 lg:w-64 bg-white border-r border-gray-200 p-4 flex-col justify-between flex-shrink-0">
    <div>
      <div className="mb-8 px-2 lg:px-4 h-8">
        <h1 className="text-2xl font-bold text-gray-800 lg:inline-block md:hidden hidden">
          Logo
        </h1>
        <h1 className="text-2xl font-bold text-gray-800 md:inline-block lg:hidden text-center">
          L
        </h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavLink href="/dashboard" icon={Home}>
          Overview
        </NavLink>
        <NavLink href="/dashboard/products" icon={Box}>
          Products
        </NavLink>
        <NavLink href="/dashboard/orders" icon={ShoppingBag}>
          Orders
        </NavLink>
        <NavLink href="/dashboard/payments" icon={CreditCard}>
          Payments
        </NavLink>
      </nav>
    </div>
    <div>
      <NavLink href="/dashboard/settings" icon={Settings}>
        Settings
      </NavLink>
    </div>
  </aside>
);
