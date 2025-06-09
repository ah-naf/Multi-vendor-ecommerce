// File Path: src/components/ProductForm.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, PlusCircle } from "lucide-react";

// This is a comprehensive product object structure based on the design
const emptyProduct = {
  general: { title: "", description: "", images: [], category: "" },
  specifications: {
    brand: "",
    model: "",
    storage: "",
    ram: "",
    color: "",
    condition: "new",
    features: {
      "5g": false,
      nfc: false,
      wirelessCharging: false,
      waterResistant: false,
    },
  },
  pricing: { price: "", salePrice: "", enableNegotiation: false },
  inventory: { quantity: "", sku: "" },
  additional: { tags: "" },
  seo: { title: "", description: "" },
};

export const ProductForm = ({
  initialProduct,
  onSave,
  onCancel,
  isEditMode,
}) => {
  // If we are editing, use the initialProduct, otherwise use the empty shell
  const [product, setProduct] = React.useState(initialProduct || emptyProduct);

  // In a real app, these would be fully implemented to manage state
  const handleInputChange = () => {};
  const handleImageUpload = () => {};
  const removeImage = () => {};

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h2>
      <p className="text-gray-500">
        Fill in the details to list your product for sale.
      </p>

      {/* General Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">General Information</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="product-title">Product Title *</Label>
            <Input id="product-title" />
          </div>
          <div>
            <Label htmlFor="product-description">Description *</Label>
            <Textarea id="product-description" rows={4} />
          </div>
          <div>
            <Label>Product Images *</Label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <Label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-red-600 hover:text-red-500"
                  >
                    <span>Select Files</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                    />
                  </Label>
                  <p className="pl-1">or drag & drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div>
            <Label>Category *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile Phones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Specifications</h3>
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add another specification
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-2">
            <Label>Brand *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Model *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iphone-15">iPhone 15</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Storage</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Storage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256gb">256 GB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>RAM *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select RAM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8gb">8 GB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Colour</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Colour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mt-6">
          <div>
            <Label className="mb-3 block">Condition *</Label>
            <RadioGroup defaultValue="new" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">New</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="open-box" id="open-box" />
                <Label htmlFor="open-box">Open Box</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="refurbished" id="refurbished" />
                <Label htmlFor="refurbished">Refurbished</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="mb-3 block">Features</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="5g" />
                <Label htmlFor="5g">5G</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="nfc" />
                <Label htmlFor="nfc">NFC</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="wireless" />
                <Label htmlFor="wireless">Wireless Charging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="water" />
                <Label htmlFor="water">Water Resistant</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-2">
            <Label>Price ($) *</Label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>Sale Price ($)</Label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input placeholder="e.g. MG-004" />
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Switch id="negotiation" />
          <Label htmlFor="negotiation">Enable Negotiation</Label>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">Additional Information</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g. smartphone, android, 5G (seperate with commas)"
            />
          </div>
          <div>
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              placeholder="Custom title for search engines"
            />
          </div>
          <div>
            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              rows={3}
              placeholder="Meta description for search engines"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Discard
        </Button>
        <Button
          className="bg-red-500 hover:bg-red-600"
          onClick={() => onSave(product)}
        >
          Save Finish
        </Button>
      </div>
    </div>
  );
};
