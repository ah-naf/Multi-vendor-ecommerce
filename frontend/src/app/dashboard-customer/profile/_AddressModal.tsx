import { AddressData } from "@/types";
import { ChangeEvent } from "react";
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
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update your existing address details."
            : "Enter the details for your new address."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Type
          </Label>
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
          <Label htmlFor="address" className="text-right">
            Address
          </Label>
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
          <Label htmlFor="isDefault" className="text-right">
            Default
          </Label>
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
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={onSaveAddress}
          disabled={isSavingAddress}
          className="bg-red-500 hover:bg-red-600"
        >
          {isSavingAddress
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
            ? "Save Changes"
            : "Add Address"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default AddressModal;
