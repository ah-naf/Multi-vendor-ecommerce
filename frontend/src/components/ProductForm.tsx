"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadCloud, X, PlusCircle, Trash2 } from "lucide-react";
import { AddSpecDialog, DynamicSpecField } from "./DynamicSpecField";

// Utility to normalize image entries
function normalizeImages(images: Array<string | any>) {
  return images.map((img, idx) =>
    typeof img === "string"
      ? {
          id: idx,
          url: img,
          name: img.split("?text=")[1]?.replace(/\+/g, " ") || `image_${idx}`,
        }
      : img
  );
}

// --- Main Product Form ---
export const ProductForm = ({
  initialProduct,
  onSave,
  onCancel,
  isEditMode,
}) => {
  const emptyProduct = {
    general: { title: "", description: "", images: [], category: "" },
    specifications: { customSpecs: [] },
    pricing: { price: "", salePrice: "", enableNegotiation: false },
    inventory: { quantity: "", sku: "" },
    additional: { tags: "" },
    seo: { title: "", description: "" },
  };

  // Initialize state with normalization when initialProduct arrives
  const [product, setProduct] = useState(
    initialProduct
      ? {
          ...initialProduct,
          general: {
            ...initialProduct.general,
            images: normalizeImages(initialProduct.general.images),
          },
        }
      : emptyProduct
  );

  useEffect(() => {
    if (initialProduct) {
      setProduct({
        ...initialProduct,
        general: {
          ...initialProduct.general,
          images: normalizeImages(initialProduct.general.images),
        },
      });
    }
  }, [initialProduct]);

  /** Generic section field updater */
  const handleInputChange = (section, field, value) => {
    setProduct((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  /** Spec handlers */
  const handleSpecUpdate = (id, field, value) => {
    setProduct((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        customSpecs: prev.specifications.customSpecs.map((spec) =>
          spec.id === id ? { ...spec, [field]: value } : spec
        ),
      },
    }));
  };
  const handleSpecAdd = (newSpec) => {
    setProduct((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        customSpecs: [...prev.specifications.customSpecs, newSpec],
      },
    }));
  };
  const handleSpecRemove = (id) => {
    setProduct((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        customSpecs: prev.specifications.customSpecs.filter(
          (spec) => spec.id !== id
        ),
      },
    }));
  };

  /** Image upload & removal */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    handleInputChange("general", "images", [
      ...product.general.images,
      ...newImages,
    ]);
  };
  const removeImage = (id) => {
    handleInputChange(
      "general",
      "images",
      product.general.images.filter((img) => img.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h2>
      <p className="text-gray-500">
        {isEditMode
          ? "Update the fields below and click Save."
          : "Fill in the details to list your new product."}
      </p>

      {/* --- General Information --- */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">General Information</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="product-title">Product Title *</Label>
              <Input
                id="product-title"
                value={product.general.title}
                onChange={(e) =>
                  handleInputChange("general", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                id="product-category"
                value={product.general.category}
                onChange={(e) =>
                  handleInputChange("general", "category", e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Description *</Label>
            <Textarea
              id="product-description"
              rows={4}
              value={product.general.description}
              onChange={(e) =>
                handleInputChange("general", "description", e.target.value)
              }
            />
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
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </Label>
                  <p className="pl-1">or drag & drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {product.general.images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Specifications --- */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Specifications</h3>
          {/* <AddSpecDialog onAdd={handleSpecAdd} /> */}
        </div>

        {product.specifications.customSpecs.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p className="mb-4">No specifications added yet.</p>
            {/* You could even re-use AddSpecDialog here for emphasis */}
            <AddSpecDialog onAdd={handleSpecAdd} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications.customSpecs.map((spec) => (
              <DynamicSpecField
                key={spec.id}
                spec={spec}
                onUpdate={handleSpecUpdate}
                onRemove={handleSpecRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Pricing & Inventory --- */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">Pricing & Inventory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-2">
            <Label>Price ($) *</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={product.pricing.price}
              onChange={(e) =>
                handleInputChange("pricing", "price", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Sale Price ($)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={product.pricing.salePrice}
              onChange={(e) =>
                handleInputChange("pricing", "salePrice", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              placeholder="0"
              value={product.inventory.quantity}
              onChange={(e) =>
                handleInputChange("inventory", "quantity", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input
              placeholder="e.g. MG-004"
              value={product.inventory.sku}
              onChange={(e) =>
                handleInputChange("inventory", "sku", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="negotiation"
            checked={product.pricing.enableNegotiation}
            onCheckedChange={(checked) =>
              handleInputChange("pricing", "enableNegotiation", checked)
            }
          />
          <Label htmlFor="negotiation">Enable Negotiation</Label>
        </div>
      </div>

      {/* --- Additional & SEO --- */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">Additional Information</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g. smartphone, android, 5G"
              value={product.additional.tags}
              onChange={(e) =>
                handleInputChange("additional", "tags", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              placeholder="Custom title for search engines"
              value={product.seo.title}
              onChange={(e) =>
                handleInputChange("seo", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              rows={3}
              placeholder="Meta description for search engines"
              value={product.seo.description}
              onChange={(e) =>
                handleInputChange("seo", "description", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Discard
        </Button>
        <Button
          className="bg-red-500 hover:bg-red-600"
          onClick={() => onSave(product)}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
