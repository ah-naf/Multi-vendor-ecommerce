import { Address } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Edit3, Home, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// --- ADDRESSES SECTION ---
interface AddressSectionProps {
  addresses: Address[];
  onAddAddressClick: () => void;
  onEditAddressClick: (address: Address) => void;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefaultAddress: (addressId: string) => Promise<void>;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  onAddAddressClick,
  onEditAddressClick,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>
            Manage your shipping and billing addresses.
          </CardDescription>
        </div>
        <Button
          onClick={onAddAddressClick}
          className="bg-red-500 hover:bg-red-600 text-white mt-3 sm:mt-0 w-full sm:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {addresses.length === 0 && (
          <p className="text-gray-500">You have no saved addresses.</p>
        )}
        {addresses.map((addr) => (
          <div key={addr._id} className="p-6 rounded-lg border bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {addr.type === "Home" && (
                  <Home className="h-6 w-6 text-gray-600" />
                )}
                {addr.type === "Work" && (
                  <Briefcase className="h-6 w-6 text-gray-600" />
                )}
                {addr.type !== "Home" && addr.type !== "Work" && (
                  <Briefcase className="h-6 w-6 text-gray-600" />
                )}{" "}
                {/* Fallback icon */}
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
              <Button
                variant="outline"
                onClick={() => onEditAddressClick(addr)}
              >
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
                <Button
                  variant="outline"
                  onClick={() => onSetDefaultAddress(addr._id!)}
                >
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

export default AddressSection;
