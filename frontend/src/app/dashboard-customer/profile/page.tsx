"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Home, Briefcase, PlusCircle } from "lucide-react";

// --- PERSONAL INFO & NOTIFICATIONS SECTION ---
const PersonalInformationSection = () => (
  <div className="space-y-8">
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" defaultValue="Alex" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" defaultValue="Johnson" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue="alex.johnson@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself"
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <div className="flex justify-end p-6 pt-0 gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          Save Changes
        </Button>
      </div>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {[
          {
            id: "order-updates",
            label: "Order updates",
            description: "Notifications about your order status.",
            checked: true,
          },
          {
            id: "promotions",
            label: "Promotions and deals",
            description: "Receive emails about our latest offers.",
            checked: true,
          },
          {
            id: "newsletter",
            label: "Newsletter",
            description: "Stay up to date with our weekly newsletter.",
            checked: false,
          },
          {
            id: "wishlist",
            label: "Wishlist updates",
            description:
              "Get notified when items on your wishlist are back in stock or on sale.",
            checked: true,
          },
        ].map((pref) => (
          <div key={pref.id} className="flex items-start justify-between">
            <div className="space-y-2">
              <Label htmlFor={pref.id} className="font-semibold">
                {pref.label}
              </Label>
              <p className="text-sm text-gray-500">{pref.description}</p>
            </div>
            <Switch id={pref.id} defaultChecked={pref.checked} />
          </div>
        ))}
      </CardContent>
      <div className="flex justify-end p-6 pt-0">
        <Button className="bg-red-500 hover:bg-red-600 text-white">
          Save Preferences
        </Button>
      </div>
    </Card>
  </div>
);

// --- ADDRESSES SECTION ---
const AddressSection = () => {
  const addresses = [
    {
      type: "Home",
      icon: Home,
      address: "12 Rosewood Lane, Flat 3A, Manchester, M14 5TP, United Kingdom",
      isDefault: true,
    },
    {
      type: "Work",
      icon: Briefcase,
      address:
        "Unit 7, Orion Business Park, Buckingham Avenue, Slough, SL1 4OT, United Kingdom",
      isDefault: false,
    },
  ];
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>
            Manage your shipping and billing addresses.
          </CardDescription>
        </div>
        <Button className="bg-red-500 hover:bg-red-600 text-white mt-3 sm:mt-0 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.map((addr, index) => (
          <div key={index} className="p-6 rounded-lg border bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <addr.icon className="h-6 w-6 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">{addr.type}</h3>
              </div>
              {addr.isDefault && (
                <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-4">{addr.address}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline">Edit</Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
              {!addr.isDefault && (
                <Button variant="outline">Set as Default</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// --- MAIN PROFILE PAGE (NO TABS) ---
export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings, preferences, and addresses.
        </p>
      </div>

      <PersonalInformationSection />

      <Separator />

      <AddressSection />
    </div>
  );
}
