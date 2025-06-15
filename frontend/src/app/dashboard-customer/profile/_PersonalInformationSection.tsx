import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { UpdateUserProfileData } from "@/types";
import { ChangeEvent } from "react";

interface PersonalInformationSectionProps {
  profile: UpdateUserProfileData;
  email?: string;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
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
            <Input
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              readOnly
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={onInputChange}
            />
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
        <Button
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
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

export default PersonalInformationSection;
