"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
import { Home, Briefcase, PlusCircle, Edit3, Trash2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  fetchUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/services/userProfileService";
import { UserProfile, Address, UpdateUserProfileData, AddressData } from "@/types";

const initialProfileData: UpdateUserProfileData = {
  firstName: "",
  lastName: "",
  phone: "",
  bio: "",
};

const initialAddressData: AddressData = {
  type: "Home",
  address: "",
  isDefault: false,
};


// --- PERSONAL INFO & NOTIFICATIONS SECTION ---
interface PersonalInformationSectionProps {
  profile: UpdateUserProfileData;
  email?: string;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  isSaving: boolean;
}

const PersonalInformationSection: React.FC<PersonalInformationSectionProps> = ({
  profile,
  email,
  onInputChange,
  onSave,
  isSaving,
}) => (
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
            <Input id="firstName" name="firstName" value={profile.firstName} onChange={onInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" value={profile.lastName} onChange={onInputChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={email} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={onInputChange} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself"
            className="min-h-[100px]"
            value={profile.bio}
            onChange={onInputChange}
          />
        </div>
      </CardContent>
      <div className="flex justify-end p-6 pt-0 gap-3">
        {/* <Button variant="outline">Cancel</Button> */}
        <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
    {/* Notification Preferences Card - remains static for now */}
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {[
          { id: "order-updates", label: "Order updates", description: "Notifications about your order status.", checked: true },
          { id: "promotions", label: "Promotions and deals", description: "Receive emails about our latest offers.", checked: true },
          { id: "newsletter", label: "Newsletter", description: "Stay up to date with our weekly newsletter.", checked: false },
          { id: "wishlist", label: "Wishlist updates", description: "Get notified when items on your wishlist are back in stock or on sale.", checked: true },
        ].map((pref) => (
          <div key={pref.id} className="flex items-start justify-between">
            <div className="space-y-2"><Label htmlFor={pref.id} className="font-semibold">{pref.label}</Label><p className="text-sm text-gray-500">{pref.description}</p></div>
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


// --- ADDRESS MODAL ---
interface AddressModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  addressData: AddressData;
  onAddressDataChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onIsDefaultChange: (isDefault: boolean) => void;
  onSaveAddress: () => Promise<void>;
  isSavingAddress: boolean;
  isEditing: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen, onOpenChange, addressData, onAddressDataChange, onIsDefaultChange, onSaveAddress, isSavingAddress, isEditing
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Address" : "Add New Address"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update your existing address details." : "Enter the details for your new address."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">Type</Label>
          <select
            id="type"
            name="type"
            value={addressData.type}
            onChange={onAddressDataChange}
            className="col-span-3 p-2 border rounded-md"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={addressData.address}
            onChange={onAddressDataChange}
            className="col-span-3"
            placeholder="123 Main St, Anytown, USA"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="isDefault" className="text-right">Default</Label>
          <Switch
            id="isDefault"
            name="isDefault"
            checked={addressData.isDefault}
            onCheckedChange={onIsDefaultChange}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="button" onClick={onSaveAddress} disabled={isSavingAddress} className="bg-red-500 hover:bg-red-600">
          {isSavingAddress ? (isEditing ? "Saving..." : "Adding..." ): (isEditing ? "Save Changes" : "Add Address")}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);


// --- ADDRESSES SECTION ---
interface AddressSectionProps {
  addresses: Address[];
  onAddAddressClick: () => void;
  onEditAddressClick: (address: Address) => void;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefaultAddress: (addressId: string) => Promise<void>;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses, onAddAddressClick, onEditAddressClick, onDeleteAddress, onSetDefaultAddress
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>Manage your shipping and billing addresses.</CardDescription>
        </div>
        <Button onClick={onAddAddressClick} className="bg-red-500 hover:bg-red-600 text-white mt-3 sm:mt-0 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.length === 0 && <p className="text-gray-500">You have no saved addresses.</p>}
        {addresses.map((addr) => (
          <div key={addr._id} className="p-6 rounded-lg border bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {addr.type === "Home" && <Home className="h-6 w-6 text-gray-600" />}
                {addr.type === "Work" && <Briefcase className="h-6 w-6 text-gray-600" />}
                {addr.type !== "Home" && addr.type !== "Work" && <Briefcase className="h-6 w-6 text-gray-600" />} {/* Fallback icon */}
                <h3 className="text-lg font-bold text-gray-800">{addr.type}</h3>
              </div>
              {addr.isDefault && (
                <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">Default</Badge>
              )}
            </div>
            <p className="text-gray-600 mb-4">{addr.address}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={() => onEditAddressClick(addr)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDeleteAddress(addr._id!)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              {!addr.isDefault && (
                <Button variant="outline" onClick={() => onSetDefaultAddress(addr._id!)}>
                  Set as Default
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// --- MAIN PROFILE PAGE ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editableProfileData, setEditableProfileData] = useState<UpdateUserProfileData>(initialProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddressData, setCurrentAddressData] = useState<AddressData>(initialAddressData);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const _fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserProfile();
      setProfile(data);
      setEditableProfileData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        bio: data.bio || "",
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    _fetchProfile();
  }, []);

  const handleProfileInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePersonalInformation = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedProfile = await updateUserProfile(editableProfileData);
      setProfile(updatedProfile); // Update main profile state
       setEditableProfileData({ // Reset editable part from new full profile
        firstName: updatedProfile.firstName || "",
        lastName: updatedProfile.lastName || "",
        phone: updatedProfile.phone || "",
        bio: updatedProfile.bio || "",
      });
      // Consider showing a success toast/message
    } catch (err: any) {
      setError(err.message || "Failed to save personal information.");
    } finally {
      setIsSaving(false);
    }
  };

  // Address Modal Handlers
  const handleAddressDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressIsDefaultChange = (isDefault: boolean) => {
    setCurrentAddressData(prev => ({ ...prev, isDefault }));
  };

  const handleOpenAddAddressModal = () => {
    setEditingAddressId(null);
    setCurrentAddressData(initialAddressData);
    setShowAddressModal(true);
  };

  const handleOpenEditAddressModal = (address: Address) => {
    setEditingAddressId(address._id!);
    setCurrentAddressData({
      type: address.type,
      address: address.address,
      isDefault: address.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    setError(null);
    try {
      if (editingAddressId) { // Update
        const updatedAddresses = await updateAddress(editingAddressId, currentAddressData);
        if (profile) setProfile(prev => ({...prev!, addresses: updatedAddresses }));
      } else { // Add
        const newAddr = await addAddress(currentAddressData);
         if (profile) {
            // If new address is default, ensure others are not
            let updatedAddresses = profile.addresses;
            if (newAddr.isDefault) {
                updatedAddresses = updatedAddresses.map(addr => ({...addr, isDefault: false}));
            }
            setProfile(prev => ({...prev!, addresses: [...updatedAddresses, newAddr]}));
         }
      }
      setShowAddressModal(false);
      _fetchProfile(); // Re-fetch to ensure data consistency, especially default flags
    } catch (err: any) {
      setError(err.message || (editingAddressId ? "Failed to update address." : "Failed to add address."));
      // Keep modal open on error to allow correction
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setIsLoading(true); // or a specific deleting state
    setError(null);
    try {
      const result = await deleteAddress(addressId);
      if (profile) setProfile(prev => ({...prev!, addresses: result.addresses}));
      _fetchProfile(); // Re-fetch for consistency
    } catch (err: any) {
      setError(err.message || "Failed to delete address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setIsLoading(true); // or a specific setting default state
    setError(null);
    try {
      const updatedAddresses = await setDefaultAddress(addressId);
      if (profile) setProfile(prev => ({...prev!, addresses: updatedAddresses}));
       _fetchProfile(); // Re-fetch for consistency
    } catch (err: any) {
      setError(err.message || "Failed to set default address.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) { // Show loader only on initial load
    return <div className="container mx-auto px-4 py-8 text-center">Loading profile...</div>;
  }

  if (error && !profile) { // Show error if initial load failed
     return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error} <Button onClick={_fetchProfile}>Try Again</Button></div>;
  }

  if (!profile) { // Should not happen if loading/error handled, but as a fallback
    return <div className="container mx-auto px-4 py-8 text-center">Profile data not available. <Button onClick={_fetchProfile}>Reload</Button></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings, preferences, and addresses.</p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>}

      {/* Pass necessary props to PersonalInformationSection */}
      <PersonalInformationSection
        profile={editableProfileData}
        email={profile.email}
        onInputChange={handleProfileInputChange}
        onSave={handleSavePersonalInformation}
        isSaving={isSaving}
      />

      <Separator />

      {/* Pass necessary props to AddressSection */}
      <AddressSection
        addresses={profile.addresses || []}
        onAddAddressClick={handleOpenAddAddressModal}
        onEditAddressClick={handleOpenEditAddressModal}
        onDeleteAddress={handleDeleteAddress}
        onSetDefaultAddress={handleSetDefaultAddress}
      />

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onOpenChange={setShowAddressModal}
        addressData={currentAddressData}
        onAddressDataChange={handleAddressDataChange}
        onIsDefaultChange={handleAddressIsDefaultChange}
        onSaveAddress={handleSaveAddress}
        isSavingAddress={isSavingAddress}
        isEditing={!!editingAddressId}
      />
    </div>
  );
}
