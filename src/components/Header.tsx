"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Box,
  ShoppingBag,
  CreditCard,
  Settings,
  Bell,
  HelpCircle,
  Globe,
  ChevronDown,
  Menu,
  Home,
  Heart, // <-- Import Heart icon
  ShoppingCart, // <-- Import ShoppingCart icon
  User, // <-- Import User icon for dropdown
  LayoutDashboard, // <-- Import Dashboard icon for dropdown
  LogOut, // <-- Import LogOut icon for dropdown
} from "lucide-react";
import React from "react";
import Link from "next/link"; // <-- Import Link for navigation

// NOTE: In a real app, user data would be passed as a prop or from a context/store.
const user = {
  name: "Alex Johnson", // Updated user name
  initials: "AJ",
  avatar: "https://github.com/shadcn.png", // Using a placeholder avatar
};

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
      {/* Mobile Menu Trigger (for a different context, e.g., seller dashboard) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Logo</h1>
          <nav className="flex flex-col space-y-2">
            <a
              href="/dashboard"
              className="flex items-center p-3 rounded-lg font-semibold bg-red-100 text-red-600"
            >
              <Home className="mr-3 h-5 w-5" />
              Overview
            </a>
            <a
              href="/dashboard/products"
              className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Box className="mr-3 h-5 w-5" />
              Products
            </a>
            <a
              href="/dashboard/orders"
              className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <ShoppingBag className="mr-3 h-5 w-5" />
              Orders
            </a>
            <a
              href="/dashboard/payments"
              className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <CreditCard className="mr-3 h-5 w-5" />
              Payments
            </a>
            <a
              href="/dashboard/settings"
              className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 mt-auto"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </nav>
        </SheetContent>
      </Sheet>

      {/* This empty div helps to push the right-side icons to the end on mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right side icons */}
      <div className="flex items-center space-x-2 ml-auto md:space-x-4">
        {/* Language Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hidden md:flex items-center space-x-1"
            >
              <Globe className="h-5 w-5" />
              <span>EN</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>English (EN)</DropdownMenuItem>
            <DropdownMenuItem>Spanish (ES)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="hidden md:inline-flex">
          <HelpCircle className="h-6 w-6 text-gray-600" />
        </Button>

        {/* --- ADDED: Wishlist and Cart Icons --- */}
        <Link href="/dashboard-customer/wishlist" passHref>
          <Button variant="ghost" size="icon">
            <Heart className="h-6 w-6 text-gray-600" />
          </Button>
        </Link>
        <Link href="/dashboard-customer/cart" passHref>
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
          </Button>
        </Link>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* --- UPDATED: Profile Dropdown Menu --- */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 cursor-pointer">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline font-semibold">{user.name}</span>
            <ChevronDown className="h-4 w-4 hidden lg:inline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard-customer" passHref>
              <DropdownMenuItem>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard-customer/profile" passHref>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
