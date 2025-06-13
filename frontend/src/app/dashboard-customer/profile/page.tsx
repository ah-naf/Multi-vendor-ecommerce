"use client";

"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import {
  fetchUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/services/userProfileService";
import {
  UserProfile,
  Address,
  UpdateUserProfileData,
  AddressData,
} from "@/types";
import { toast } from "sonner";
import PersonalInformationSection from "./_PersonalInformationSection";
import AddressSection from "./_AddressSection";
import AddressModal from "./_AddressModal";

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

// --- MAIN PROFILE PAGE ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editableProfileData, setEditableProfileData] =
    useState<UpdateUserProfileData>(initialProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddressData, setCurrentAddressData] =
    useState<AddressData>(initialAddressData);
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

  const handleProfileInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditableProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonalInformation = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedProfile = await updateUserProfile(editableProfileData);
      setProfile(updatedProfile); // Update main profile state
      setEditableProfileData({
        // Reset editable part from new full profile
        firstName: updatedProfile.firstName || "",
        lastName: updatedProfile.lastName || "",
        phone: updatedProfile.phone || "",
        bio: updatedProfile.bio || "",
      });
      toast.success("Personal information updated successfully");
      // Consider showing a success toast/message
    } catch (err: any) {
      setError(err.message || "Failed to save personal information.");
    } finally {
      setIsSaving(false);
    }
  };

  // Address Modal Handlers
  const handleAddressDataChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressIsDefaultChange = (isDefault: boolean) => {
    setCurrentAddressData((prev) => ({ ...prev, isDefault }));
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
      if (editingAddressId) {
        // Update existing address
        const updatedAddresses = await updateAddress(
          editingAddressId,
          currentAddressData
        );
        if (profile) {
          setProfile((prev) => ({
            ...prev!,
            addresses: updatedAddresses,
          }));
        }
      } else {
        // Add new address
        const newAddr = await addAddress(currentAddressData);
        if (profile) {
          setProfile((prev) => {
            // Ensure we always have an array to work with
            const prevAddrs = prev?.addresses ?? [];

            // If the new address is default, clear other defaults
            const resetAddrs = newAddr.isDefault
              ? prevAddrs.map((addr) => ({ ...addr, isDefault: false }))
              : prevAddrs;

            // Append the new address
            return {
              ...prev!,
              addresses: [...resetAddrs, newAddr],
            };
          });
        }
      }

      setShowAddressModal(false);
      _fetchProfile(); // Re-fetch to ensure data consistency, especially default flags
    } catch (err: any) {
      setError(
        err.message ||
          (editingAddressId
            ? "Failed to update address."
            : "Failed to add address.")
      );
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
      if (profile)
        setProfile((prev) => ({ ...prev!, addresses: result.addresses }));
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
      if (profile)
        setProfile((prev) => ({ ...prev!, addresses: updatedAddresses }));
      _fetchProfile(); // Re-fetch for consistency
    } catch (err: any) {
      setError(err.message || "Failed to set default address.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    // Show loader only on initial load
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading profile...
      </div>
    );
  }

  if (error && !profile) {
    // Show error if initial load failed
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error: {error} <Button onClick={_fetchProfile}>Try Again</Button>
      </div>
    );
  }

  if (!profile) {
    // Should not happen if loading/error handled, but as a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Profile data not available.{" "}
        <Button onClick={_fetchProfile}>Reload</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings, preferences, and addresses.
        </p>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

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
