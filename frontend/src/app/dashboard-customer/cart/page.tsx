"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";

// --- MOCK DATA & TYPES ---
// In a real app, this data would come from a global state/context or an API call.
const initialCartItems = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    attributes: "Black | Premium Edition",
    price: 249.99,
    quantity: 1,
    image: "/placeholder-image.svg",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    attributes: "Graphite | Large",
    price: 199.5,
    quantity: 1,
    image: "/placeholder-image.svg",
  },
  {
    id: 3,
    name: "Ultra-Thin Laptop",
    attributes: "13-inch | 16GB RAM",
    price: 1299.0,
    quantity: 1,
    image: "/placeholder-image.svg",
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    attributes: "Ocean Blue",
    price: 79.99,
    quantity: 2,
    image: "/placeholder-image.svg",
  },
];

type CartItemType = (typeof initialCartItems)[number] & { selected?: boolean };

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>(
    initialCartItems.map((item) => ({ ...item, selected: true }))
  );

  // --- HANDLER FUNCTIONS ---
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Quantity cannot be less than 1
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleItemSelect = (id: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setCartItems(cartItems.map((item) => ({ ...item, selected: checked })));
  };

  const handleDeleteItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleDeleteSelected = () => {
    setCartItems(cartItems.filter((item) => !item.selected));
  };

  // --- MEMOIZED CALCULATIONS ---
  const { subtotal, tax, total, isAllSelected, selectedItemCount } =
    useMemo(() => {
      const selectedItems = cartItems.filter((item) => item.selected);
      const sub = selectedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const taxAmount = sub * 0.1; // Example 10% tax
      const tot = sub + taxAmount; // Assuming free shipping for now

      return {
        subtotal: sub,
        tax: taxAmount,
        total: tot,
        isAllSelected:
          cartItems.length > 0 && selectedItems.length === cartItems.length,
        selectedItemCount: selectedItems.length,
      };
    }, [cartItems]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
      <p className="text-gray-500 mb-8">
        You have {cartItems.length} items in your cart.
      </p>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">Your cart is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="font-semibold">
                  Select All ({selectedItemCount} items)
                </label>
              </div>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6"
                >
                  <div className="flex items-center gap-4 flex-grow">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => handleItemSelect(item.id)}
                    />
                    <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0">
                      {/* In a real app, use Next/Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.attributes}</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        readOnly
                        className="w-12 text-center border-0 h-9 focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Input placeholder="Enter a promo code" />
                  <Button variant="outline">Apply</Button>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-12 text-lg bg-red-500 hover:bg-red-500 disabled:bg-gray-800"
                  disabled={selectedItemCount === 0}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
