"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Briefcase, Plus } from "lucide-react";
import { Header } from "@/components/Header";

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState("home");
  const [paymentMethod, setPaymentMethod] = useState("redirect");
  const [billingAddress, setBillingAddress] = useState(false);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const orderItems = [
    {
      id: 1,
      name: "Wireless Noise-Cancelling Headphones",
      edition: "Black Premium Edition",
      price: 249.99,
      quantity: 1,
      image: "/api/placeholder/60/60",
    },
    {
      id: 2,
      name: "Wireless Noise-Cancelling Headphones",
      edition: "Black Premium Edition",
      price: 249.99,
      quantity: 1,
      image: "/api/placeholder/60/60",
    },
    {
      id: 3,
      name: "Wireless Noise-Cancelling Headphones",
      edition: "Black Premium Edition",
      price: 249.99,
      quantity: 1,
      image: "/api/placeholder/60/60",
    },
    {
      id: 4,
      name: "Wireless Noise-Cancelling Headphones",
      edition: "Black Premium Edition",
      price: 249.99,
      quantity: 1,
      image: "/api/placeholder/60/60",
    },
  ];

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 69.99;
  const tax = 2.0;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Replace with your Header component */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
          <div className="text-sm text-gray-500 mb-6">
            Review your order and complete your purchase
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">
                Checkout
              </span>
            </div>
            <div className="h-px bg-gray-300 flex-1"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 ">
                {/* Saved Addresses */}
                <div>
                  <Label className="text-sm font-medium mb-4 block">
                    Saved Addresses
                  </Label>
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                  >
                    <div className="space-y-3 ">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="home" id="home" />
                        <Home className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <Label htmlFor="home" className="font-medium">
                            Home / Default
                          </Label>
                          <p className="text-sm text-gray-500">
                            3929 Lemon Grove Rd. Apt. 54. State CA | 81001
                            United Kingdom
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="work" id="work" />
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <Label htmlFor="work" className="font-medium">
                            Work
                          </Label>
                          <p className="text-sm text-gray-500">
                            1700 Golden Grove Park. Rosevilleville. Awesome
                            Georgia. 69 CXT United
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Enter Product Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input id="phoneNumber" placeholder="Enter Product Name" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" placeholder="Enter Product Name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input id="address1" placeholder="Enter Product Name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input id="address2" placeholder="Enter Product Name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="Enter Product Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                    <Input id="zipCode" placeholder="Enter Product Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Enter Product Name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bd">Bangladesh</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input id="state" placeholder="Enter Product Name" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billingAddress"
                    checked={billingAddress}
                    onCheckedChange={setBillingAddress}
                  />
                  <Label htmlFor="billingAddress" className="text-sm">
                    Billing address is the same as shipping
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700">
                    You will be redirected to XYZ gateway, to complete your
                    transaction.
                    <br />
                    <span className="text-sm">
                      NO monthly fees, Reasonable charges. You might want to
                      check if your are in country. You might want to.
                    </span>
                  </AlertDescription>
                </Alert>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="redirect" id="redirect" />
                    <Label htmlFor="redirect" className="text-sm">
                      (Redirected) will completely my payment to a secure
                      external gateway. (Recommended)
                    </Label>
                  </div>
                </RadioGroup>

                <div className="text-sm text-gray-500">
                  Cards, GooglePay, ApplePay, are all supported by clicking.{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Please check here.
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cashOnDelivery"
                    checked={cashOnDelivery}
                    onCheckedChange={setCashOnDelivery}
                  />
                  <Label
                    htmlFor="cashOnDelivery"
                    className="text-sm font-medium"
                  >
                    Cash On Delivery
                  </Label>
                  <Badge variant="secondary" className="ml-2">
                    NEW
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  Payment collected upon delivery
                </p>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter a promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button>Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-400 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.edition}</p>
                      <p className="text-sm font-medium">${item.price}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
