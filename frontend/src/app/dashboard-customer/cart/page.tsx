"use client";

import React, { useState } from "react"; // Added useState
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
// import { Header } from '@/components/Header'; // Assuming you want the main header -- REMOVED
import { toast } from "sonner";
import { MinusCircle, PlusCircle, Trash2, XCircle } from "lucide-react";
import { getBackendBaseUrl } from "@/services/productService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"; // Added Dialog components

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getTotalItems,
  } = useCart();

  const [showRemoveItemDialog, setShowRemoveItemDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{id: string, name: string} | null>(null);

  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [showQuantityRemoveDialog, setShowQuantityRemoveDialog] = useState(false);
  const [itemForQuantityRemoval, setItemForQuantityRemoval] = useState<string | null>(null);


  const handleQuantityChange = (
    productId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      setItemForQuantityRemoval(productId);
      setShowQuantityRemoveDialog(true);
    } else {
      updateQuantity(productId, newQuantity);
      toast.success("Quantity updated.");
    }
  };

  const confirmRemoveFromQuantity = () => {
    if (itemForQuantityRemoval) {
      removeFromCart(itemForQuantityRemoval);
      toast.info("Item removed from cart.");
    }
    setShowQuantityRemoveDialog(false);
    setItemForQuantityRemoval(null);
  };


  const handleRemoveItem = (productId: string, itemName: string) => {
    setItemToRemove({ id: productId, name: itemName });
    setShowRemoveItemDialog(true);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id);
      toast.info(`${itemToRemove.name} removed from cart.`);
    }
    setShowRemoveItemDialog(false);
    setItemToRemove(null);
  };

  const handleClearCart = () => {
    setShowClearCartDialog(true);
  };

  const confirmClearCart = () => {
    clearCart();
    toast.info("Cart cleared.");
    setShowClearCartDialog(false);
  };

  const totalItems = getTotalItems();
  const cartTotal = getCartTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> -- REMOVED */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <XCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-700 mb-2">Your cart is empty.</p>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/" passHref>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {totalItems} item{totalItems > 1 ? "s" : ""} in your cart
                </h2>
                <Dialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      // onClick={handleClearCart} // DialogTrigger handles open
                      className="text-sm text-red-500 hover:text-red-700 border-red-300 hover:border-red-500"
                      disabled={cartItems.length === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Entire Cart?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove all items from your shopping cart? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowClearCartDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={confirmClearCart}>Yes, Clear Cart</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={`${getBackendBaseUrl()}${item.image}`}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Price: ${item.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Item Total: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity,
                            -1
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <MinusCircle className="h-6 w-6" />
                      </Button>
                      <span className="text-lg font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity, 1)
                        }
                        className="text-green-500 hover:text-green-700"
                      >
                        <PlusCircle className="h-6 w-6" />
                      </Button>
                    </div>
                    <Dialog open={showRemoveItemDialog && itemToRemove?.id === item.productId} onOpenChange={(isOpen) => { if(!isOpen) setItemToRemove(null); setShowRemoveItemDialog(isOpen);}}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.productId, item.name)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove {itemToRemove?.name}?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove this item from your cart?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {setItemToRemove(null); setShowRemoveItemDialog(false);}}>Cancel</Button>
                          <Button variant="destructive" onClick={confirmRemoveItem}>Remove Item</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>

            <Dialog open={showQuantityRemoveDialog} onOpenChange={setShowQuantityRemoveDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Item?</DialogTitle>
                  <DialogDescription>
                    Reducing quantity to zero will remove this item from the cart. Do you want to proceed?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {setItemForQuantityRemoval(null); setShowQuantityRemoveDialog(false)}}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmRemoveFromQuantity}>Yes, Remove</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Estimated Tax</span>
                    <span className="font-semibold">$0.00</span>{" "}
                    {/* Placeholder */}
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t">
                  <span>Order Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                <Link href="/checkout" passHref>
                  <Button
                    className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white py-3 text-lg"
                    // onClick logic removed as Link handles navigation
                  >
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/" passHref>
                  <Button
                    variant="link"
                    className="w-full mt-4 text-red-500 hover:text-red-700"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
