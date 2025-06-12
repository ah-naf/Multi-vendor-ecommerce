"use client";

import React, { useState, useEffect } from "react";
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
import { Home, Briefcase, PlusCircle, Edit3, Trash2 } from "lucide-react";

// --- MOCK SERVICES ---
// Replace with actual service imports later
// Assuming userProfileService is generic enough for sellers too
const mockUserProfileService = {
  getUserProfile: async (token: string) => {
    console.log("Mock: Fetching user profile (seller)...");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      _id: "seller123",
      name: "Sarah Seller",
      email: "sarah.seller@example.com",
      phone: "+1 (555) 987-6543",
      bio: "Experienced seller providing quality products.",
      isAdmin: false, // Sellers are not necessarily admins
      role: "seller",
      addresses: [
        { _id: "s_addr1", street: "123 Seller St", city: "Sellerville", state: "CA", zip: "90210", country: "United States", isDefault: true, type: "Business" },
      ],
    };
  },
  updateUserProfile: async (data: any, token: string) => {
    console.log("Mock: Updating user profile (seller)...", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...data, _id: "seller123" };
  },
  addAddress: async (address: any, token: string) => {
    console.log("Mock: Adding address (seller)...", address);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...address, _id: `s_addr${Date.now()}` };
  },
  updateAddress: async (addressId: string, address: any, token: string) => {
    console.log("Mock: Updating address (seller)...", addressId, address);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...address, _id: addressId };
  },
  deleteAddress: async (addressId: string, token: string) => {
    console.log("Mock: Deleting address (seller)...", addressId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
};

// --- TYPES ---
interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
  type?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  isAdmin: boolean;
  addresses: Address[];
  role?: string; // Added role for clarity
}

// --- PERSONAL INFO & NOTIFICATIONS SECTION ---
const PersonalInformationSection = ({ userProfile, onSave, token }: { userProfile: UserProfile | null, onSave: (data: any) => Promise<void>, token: string | null }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const nameParts = userProfile.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(userProfile.email);
      setPhone(userProfile.phone);
      setBio(userProfile.bio);
    }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    if (!token) {
      alert("Authentication token not found.");
      return;
    }
    setIsLoading(true);
    try {
      await onSave({
        name: `${firstName} ${lastName}`,
        email,
        phone,
        bio,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Sarah" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Seller" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah.seller@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 987-6543" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your business" className="min-h-[100px]" />
          </div>
        </CardContent>
        <div className="flex justify-end p-6 pt-0 gap-3">
          <Button variant="outline" disabled={isLoading}>Cancel</Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
      {/* Notification Preferences Card (static for now, can be adapted for sellers) */}
      <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {[
          { id: "order-updates", label: "New order alerts", description: "Notifications about new customer orders.", checked: true },
          { id: "product-reviews", label: "New product reviews", description: "Receive notifications for new reviews on your products.", checked: true },
          { id: "seller-updates", label: "Platform updates for sellers", description: "Stay up to date with important news for sellers.", checked: true },
        ].map((pref) => (
          <div key={pref.id} className="flex items-start justify-between">
            <div className="space-y-2">
              <Label htmlFor={pref.id} className="font-semibold">{pref.label}</Label>
              <p className="text-sm text-gray-500">{pref.description}</p>
            </div>
            <Switch id={pref.id} defaultChecked={pref.checked} />
          </div>
        ))}
      </CardContent>
      <div className="flex justify-end p-6 pt-0">
        <Button className="bg-red-500 hover:bg-red-600 text-white">Save Preferences</Button>
      </div>
    </Card>
    </div>
  );
};

// --- ADDRESS FORM MODAL/INLINE ---
const AddressForm = ({
  address,
  onSave,
  onCancel,
  isLoading,
}: {
  address?: Address | null;
  onSave: (data: Address) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [street, setStreet] = useState(address?.street || "");
  const [city, setCity] = useState(address?.city || "");
  const [state, setState] = useState(address?.state || "");
  const [zip, setZip] = useState(address?.zip || "");
  const [country, setCountry] = useState(address?.country || "");
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);
  const [type, setType] = useState(address?.type || "Business");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ _id: address?._id, street, city, state, zip, country, isDefault, type });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-lg border bg-white space-y-4 my-4">
      <h3 className="text-lg font-semibold">{address ? "Edit Address" : "Add New Address"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} required />
        <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="State/Province" value={state} onChange={(e) => setState(e.target.value)} required />
        <Input placeholder="Zip/Postal Code" value={zip} onChange={(e) => setZip(e.target.value)} required />
      </div>
      <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
      <Input placeholder="Label (e.g. Business, Warehouse)" value={type} onChange={(e) => setType(e.target.value)} />
      <div className="flex items-center space-x-2">
        <Switch id="isDefault" checked={isDefault} onCheckedChange={setIsDefault} />
        <Label htmlFor="isDefault">Set as default address</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white" disabled={isLoading}>
          {isLoading ? "Saving..." : (address ? "Save Changes" : "Add Address")}
        </Button>
      </div>
    </form>
  );
};


// --- ADDRESSES SECTION ---
const AddressSection = ({ addresses, onAdd, onEdit, onDelete, onSetDefault, token }: {
  addresses: Address[],
  onAdd: (address: Address) => Promise<void>,
  onEdit: (addressId: string, address: Address) => Promise<void>,
  onDelete: (addressId: string) => Promise<void>,
  onSetDefault: (addressId: string) => Promise<void>,
  token: string | null
}) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (addressData: Address) => {
    if (!token) {
      alert("Authentication token not found.");
      return;
    }
    setIsLoading(true);
    try {
      if (editingAddress && editingAddress._id) {
        await onEdit(editingAddress._id, addressData);
        alert("Address updated successfully!");
      } else {
        await onAdd(addressData);
        alert("Address added successfully!");
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error("Failed to save address", error);
      alert("Failed to save address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!token || !addressId) {
      alert("Authentication token or Address ID not found.");
      return;
    }
    if (!confirm("Are you sure you want to delete this address?")) return;
    setIsLoading(true);
    try {
      await onDelete(addressId);
      alert("Address deleted successfully!");
    } catch (error) {
      console.error("Failed to delete address", error);
      alert("Failed to delete address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!token || !addressId) {
      alert("Authentication token or Address ID not found.");
      return;
    }
    setIsLoading(true);
    try {
      await onSetDefault(addressId);
      alert("Default address updated successfully!");
    } catch (error) {
      console.error("Failed to set default address", error);
      alert("Failed to set default address.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressIcon = (type?: string) => {
    if (type?.toLowerCase() === 'business' || type?.toLowerCase() === 'work') return Briefcase;
    return Home; // Default to Home or a generic icon
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>Manage your business and shipping addresses.</CardDescription>
        </div>
        {!showAddressForm && (
          <Button className="bg-red-500 hover:bg-red-600 text-white mt-3 sm:mt-0 w-full sm:w-auto" onClick={handleAddNewAddress}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Address
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddressForm && (
          <AddressForm
            address={editingAddress}
            onSave={handleSaveAddress}
            onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
            isLoading={isLoading}
          />
        )}
        {addresses.map((addr) => {
          const IconComponent = getAddressIcon(addr.type);
          return (
            <div key={addr._id} className="p-6 rounded-lg border bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">{addr.type || 'Address'}</h3>
                </div>
                {addr.isDefault && (
                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">Default</Badge>
                )}
              </div>
              <p className="text-gray-600 mb-4">{`${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" onClick={() => handleEditAddress(addr)} disabled={isLoading}><Edit3 className="mr-1 h-4 w-4" />Edit</Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => addr._id && handleDeleteAddress(addr._id)} disabled={isLoading || !addr._id}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                {!addr.isDefault && addr._id && (
                  <Button variant="outline" onClick={() => addr._id && handleSetDefault(addr._id)} disabled={isLoading}>Set as Default</Button>
                )}
              </div>
            </div>
          );
        })}
        {addresses.length === 0 && !showAddressForm && <p>No addresses found. Add a new one!</p>}
      </CardContent>
    </Card>
  );
};

// --- MAIN PROFILE PAGE ---
export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Assume token is managed by a context or similar in a real app
  const [token] = useState<string | null>("mock-auth-token-seller"); // Replace with actual token management

  const fetchProfileData = async () => {
    if (!token) {
      setIsLoading(false);
      console.error("Authentication token not found.");
      alert("You are not authenticated. Please log in.");
      return;
    }
    setIsLoading(true);
    try {
      // Using the same mock service, but it's adapted to return seller-like data for this page.
      // In a real app, userProfileService.getUserProfile would hit the same backend endpoint,
      // and the backend would return the profile of the authenticated user (customer or seller).
      const profileData = await mockUserProfileService.getUserProfile(token);
      setUserProfile(profileData as UserProfile);
    } catch (error) {
      console.error("Failed to fetch seller profile data", error);
      alert("Failed to load seller profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);


  const handleSavePersonalInfo = async (data: { name: string; email: string; phone: string; bio: string }) => {
    if (!token || !userProfile) return;
    await mockUserProfileService.updateUserProfile({ ...userProfile, ...data }, token);
    fetchProfileData();
  };

  const handleAddAddress = async (address: Address) => {
    if (!token) return;
    await mockUserProfileService.addAddress(address, token);
    fetchProfileData();
  };

  const handleEditAddress = async (addressId: string, address: Address) => {
    if (!token) return;
    await mockUserProfileService.updateAddress(addressId, address, token);
    fetchProfileData();
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!token) return;
    await mockUserProfileService.deleteAddress(addressId, token);
    fetchProfileData();
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!token || !userProfile) return;
    const addressToUpdate = userProfile.addresses.find(addr => addr._id === addressId);
    if (addressToUpdate) {
        await mockUserProfileService.updateAddress(addressId, { ...addressToUpdate, isDefault: true }, token);
        fetchProfileData();
    }
  };

  if (isLoading && !userProfile) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>Loading seller profile...</p></div>;
  }

  if (!userProfile) {
    return <div className="container mx-auto px-4 py-8 text-center"><p>Could not load seller profile. Please try again later.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Seller Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your seller account settings, preferences, and addresses.</p>
      </div>

      <PersonalInformationSection userProfile={userProfile} onSave={handleSavePersonalInfo} token={token} />
      <Separator />
      <AddressSection
        addresses={userProfile.addresses}
        onAdd={handleAddAddress}
        onEdit={handleEditAddress}
        onDelete={handleDeleteAddress}
        onSetDefault={handleSetDefaultAddress}
        token={token}
      />
    </div>
  );
}
