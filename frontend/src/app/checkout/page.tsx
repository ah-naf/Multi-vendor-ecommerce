"use client";

import { useState, useEffect } from "react"; // Added useEffect
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
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { getBackendBaseUrl } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation'; // Added
import { toast } from 'sonner'; // Added (ensure it's available)

// Define Address Type
interface Address {
  _id: string;
  type: string;
  address: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  // const [selectedAddress, setSelectedAddress] = useState("home"); // Removed
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]); // Added
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null); // Added
  const [addressLoading, setAddressLoading] = useState<boolean>(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Form states for manual address entry
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [formState, setFormState] = useState(''); // Renamed from 'state'

  const [paymentMethod, setPaymentMethod] = useState("redirect"); // This will become non-interactive
  const [billingAddress, setBillingAddress] = useState(false);
  const [cashOnDelivery, setCashOnDelivery] = useState(true); // Default to true
  const [promoCode, setPromoCode] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Added

  const { cartItems, getCartTotal, clearCart } = useCart(); // Added clearCart
  const { token, user } = useAuth(); // Added user
  const router = useRouter(); // Added

  // Pre-fill form fields if user is logged in
  useEffect(() => {
    if (user) {
      setFullName(user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || ''));
      setEmail(user.email || '');
      // Add other pre-fills if available, e.g., phone from user profile
    }
  }, [user]);

  // Fetch Addresses Logic
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) {
        setAddressLoading(false);
        setAddressError("Please log in to view addresses.");
        return;
      }
      try {
        setAddressLoading(true);
        const response = await fetch("/api/users/addresses", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch addresses");
        }
        const data: Address[] = await response.json();
        setSavedAddresses(data);
        const defaultAddress = data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0]._id); // Select the first address if no default
        }
        setAddressError(null);
      } catch (error: any) {
        setAddressError(error.message || "An error occurred while fetching addresses.");
        setSavedAddresses([]); // Clear addresses on error
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [token]);

  // const orderItems = [
  //   {
  //     id: 1,
  //     name: "Wireless Noise-Cancelling Headphones",
  //     edition: "Black Premium Edition",
  //     price: 249.99,
  //     quantity: 1,
  //     image: "/api/placeholder/60/60",
  //   },
  //   {
  //     id: 2,
  //     name: "Wireless Noise-Cancelling Headphones",
  //     edition: "Black Premium Edition",
  //     price: 249.99,
  //     quantity: 1,
  //     image: "/api/placeholder/60/60",
  //   },
  //   {
  //     id: 3,
  //     name: "Wireless Noise-Cancelling Headphones",
  //     edition: "Black Premium Edition",
  //     price: 249.99,
  //     quantity: 1,
  //     image: "/api/placeholder/60/60",
  //   },
  //   {
  //     id: 4,
  //     name: "Wireless Noise-Cancelling Headphones",
  //     edition: "Black Premium Edition",
  //     price: 249.99,
  //     quantity: 1,
  //     image: "/api/placeholder/60/60",
  //   },
  // ];

  const subtotal = getCartTotal(); // Updated
  const shipping = 69.99; // Static as per requirement
  const tax = 2.0; // Static as per requirement
  const total = subtotal + shipping + tax; // Recalculated

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    if (!selectedAddressId && (!fullName || !address1 || !city || !formState || !zipCode || !country || !phoneNumber || !email)) {
      toast.error("Please fill in all required shipping address fields or select a saved address.");
      setIsPlacingOrder(false);
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      setIsPlacingOrder(false);
      return;
    }

    const orderPayloadItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      attributes: item.attributes, // Ensure attributes are passed if they exist on CartItem type
    }));

    let payload;
    if (selectedAddressId) {
      payload = {
        items: orderPayloadItems,
        shippingAddressId: selectedAddressId,
      };
    } else {
      // Using new address from form
      payload = {
        items: orderPayloadItems,
        shippingAddressDetails: {
          name: fullName,
          address: address2 ? `${address1}, ${address2}` : address1,
          city,
          state: formState,
          zip: zipCode,
          country,
          phone: phoneNumber,
        },
      };
    }

    try {
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setIsPlacingOrder(false);
        return;
      }
      const response = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Order placed successfully!');
        await clearCart();
        router.push(`/dashboard-customer/my-order/${responseData.id}`);
      } else {
        throw new Error(responseData.message || 'Failed to place order.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
                    value={selectedAddressId || ""} // Ensure value is not null
                    onValueChange={setSelectedAddressId}
                    className="space-y-3"
                  >
                    {addressLoading && <p>Loading addresses...</p>}
                    {addressError && !addressLoading && (
                      <Alert variant="destructive"><AlertDescription>{addressError}</AlertDescription></Alert>
                    )}
                    {!addressLoading && !addressError && savedAddresses.length === 0 && (
                      <p>No saved addresses. Please add one below or in your profile.</p>
                    )}
                    {!addressLoading && !addressError && savedAddresses.map((addr) => (
                      <div key={addr._id} className="flex items-center space-x-3 p-4 border rounded-lg hover:border-gray-400 cursor-pointer">
                        <RadioGroupItem value={addr._id} id={addr._id} />
                        {/* Icon can be conditional based on addr.type */}
                        {addr.type.toLowerCase() === 'home' && <Home className="w-5 h-5 text-gray-500" />}
                        {addr.type.toLowerCase() === 'work' && <Briefcase className="w-5 h-5 text-gray-500" />}
                        {/* Add more icons or a default one if needed */}
                        <div className="flex-1" onClick={() => setSelectedAddressId(addr._id)}>
                          <Label htmlFor={addr._id} className="font-medium cursor-pointer">
                            {addr.type} {addr.isDefault && <Badge variant="outline" className="ml-2">Default</Badge>}
                          </Label>
                          <p className="text-sm text-gray-500">{addr.address}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                 {/* "Add New Address" Button - Consider adding this for better UX later */}
                 {/* <div className="mt-4">
                    <Button variant="outline" onClick={() => {}}> <Plus className="mr-2 h-4 w-4" /> Add New Address</Button>
                </div> */}

                {/* Form Fields for new address (can be conditionally shown) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!!selectedAddressId} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input id="phoneNumber" placeholder="+1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!!selectedAddressId} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!selectedAddressId} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input id="address1" placeholder="123 Main St" value={address1} onChange={(e) => setAddress1(e.target.value)} disabled={!!selectedAddressId} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input id="address2" placeholder="Apartment, suite, etc." value={address2} onChange={(e) => setAddress2(e.target.value)} disabled={!!selectedAddressId} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="Your City" value={city} onChange={(e) => setCity(e.target.value)} disabled={!!selectedAddressId} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                    <Input id="zipCode" placeholder="12345" value={zipCode} onChange={(e) => setZipCode(e.target.value)} disabled={!!selectedAddressId} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={country} onValueChange={setCountry} disabled={!!selectedAddressId}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add more countries as needed */}
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="BD">Bangladesh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input id="state" placeholder="Your State/Province" value={formState} onChange={(e) => setFormState(e.target.value)} disabled={!!selectedAddressId} />
                </div>

                {/* Optionally, add a checkbox to toggle manual address entry based on selectedAddressId */}
                 <p className="text-sm text-gray-500">
                   {selectedAddressId ? "Using saved address. To enter a new address, first unselect the saved address above (feature to unselect can be added)." : "Please fill in your shipping details."}
                 </p>

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
                {/*
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
                */}

                <div className="flex items-center space-x-2 pt-4"> {/* Added pt-4 for spacing after commented section */}
                  <Checkbox
                    id="cashOnDelivery"
                    checked={true} // Always checked
                    disabled={true} // User cannot change it
                    aria-readonly="true" // For accessibility
                    // onCheckedChange={setCashOnDelivery} // No longer needed as it's always true
                  />
                  <Label
                    htmlFor="cashOnDelivery"
                    className="text-sm font-medium"
                  >
                    Cash On Delivery
                  </Label>
                  <Badge variant="secondary" className="ml-2">
                    ONLY OPTION
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 ml-6"> {/* This assumes Checkbox takes up some space, adjust if needed */}
                  Payment will be collected upon delivery.
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
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      {item.image ? (
                        <Image
                          src={`${getBackendBaseUrl()}${item.image}`}
                          alt={item.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      {/* Assuming 'edition' is not part of cartItem, removing or can be adapted if available */}
                      {/* <p className="text-xs text-gray-500">{item.edition}</p> */}
                      <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Qty: {item.quantity}
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

                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cartItems.length === 0 || addressLoading || (!selectedAddressId && !fullName) } // Basic disable condition
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
