import { AddressData } from "@/types";
import { ChangeEvent } from "react";
import {
  Home,
  Briefcase,
  PlusCircle,
  Edit3,
  Trash2,
  Save,
  X,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AddressModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  addressData: AddressData;
  onAddressDataChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onIsDefaultChange: (isDefault: boolean) => void;
  onSaveAddress: () => Promise<void>;
  isSavingAddress: boolean;
  isEditing: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onOpenChange,
  addressData,
  onAddressDataChange,
  onIsDefaultChange,
  onSaveAddress,
  isSavingAddress,
  isEditing,
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[400px] p-0">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            {isEditing
              ? "Update your existing address details."
              : "Enter the details for your new address."}
          </DialogDescription>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 space-y-4">
        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium">
            Type
          </Label>
          <select
            id="type"
            name="type"
            value={addressData.type}
            onChange={onAddressDataChange}
            className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine1" className="text-sm font-medium">
            Address Line 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addressLine1"
            name="addressLine1"
            value={addressData.addressLine1}
            onChange={onAddressDataChange}
            placeholder="123 Main Street"
            className="h-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine2" className="text-sm font-medium">
            Address Line 2
          </Label>
          <Input
            id="addressLine2"
            name="addressLine2"
            value={addressData.addressLine2}
            onChange={onAddressDataChange}
            placeholder="Apt, Suite, Unit (optional)"
            className="h-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* City / State */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            City / State <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="city"
              name="city"
              value={addressData.city}
              onChange={onAddressDataChange}
              placeholder="City"
              className="h-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            <Input
              id="state"
              name="state"
              value={addressData.state}
              onChange={onAddressDataChange}
              placeholder="State/Province"
              className="h-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Zip / Country */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Zip / Country <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="zipCode"
              name="zipCode"
              value={addressData.zipCode}
              onChange={onAddressDataChange}
              placeholder="Zip/Postal Code"
              className="h-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            <Input
              id="country"
              name="country"
              value={addressData.country}
              onChange={onAddressDataChange}
              placeholder="Country"
              className="h-10 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Default Toggle */}
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="isDefault" className="text-sm font-medium">
            Default
          </Label>
          <Switch
            id="isDefault"
            name="isDefault"
            checked={addressData.isDefault}
            onCheckedChange={onIsDefaultChange}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="px-6"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSaveAddress}
          disabled={isSavingAddress}
          className="bg-red-500 hover:bg-red-600 px-6"
        >
          {isSavingAddress
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
            ? "Save Changes"
            : "Add Address"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default AddressModal;
