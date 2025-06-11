"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UploadCloud, X, PlusCircle, Trash2 } from "lucide-react";
import { AddSpecDialog, DynamicSpecField } from "./DynamicSpecField";

import { Product } from "@/types"; // Assuming Product type is defined here matching backend schema

// Interface for the form's internal state, handling local image previews
// Images in form state can be existing (string URL) or new (File object)
export interface ProductFormState extends Omit<Product, 'general' | 'seller'> {
  // Omit 'seller' as it's handled by backend; 'id' is part of Product
  general: Omit<Product['general'], 'images'> & {
    images: Array<{ id: string; url: string; name: string; file?: File }>; // file is optional, for new uploads
  };
}

// Props for the ProductForm component
interface ProductFormProps {
  initialData?: Product; // Full product data for editing
  onSubmit: (formData: FormData) => Promise<void>;
  mode: 'create' | 'edit';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


// Utility to normalize image entries for display
function normalizeDisplayImages(imagesFromServer: string[]): Array<{ id: string; url: string; name: string }> {
  return imagesFromServer.map((imgUrl, idx) => {
    const name = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
    return {
      // For existing images, URL is the server path. Prepend API base for display if relative.
      id: `existing-${idx}-${name}`, // Create a unique ID for existing images
      url: imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`,
      name: name || `image_${idx}`,
    };
  });
}


// --- Main Product Form ---
export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  mode,
}) => {
  const emptyProductFormState: ProductFormState = {
    id: "", // Will be set for create mode, or from initialData for edit
    general: { title: "", description: "", images: [], category: "" },
    specifications: { customSpecs: [] },
    pricing: { price: "", salePrice: "", enableNegotiation: false },
    inventory: { quantity: "", sku: "" },
    additional: { tags: "" },
    seo: { title: "", description: "" },
  };

  // Initialize state
  const [productState, setProductState] = useState<ProductFormState>(() => {
    if (mode === 'edit' && initialData) {
      return {
        ...initialData,
        general: {
          ...initialData.general,
          images: normalizeDisplayImages(initialData.general.images || []),
        },
      };
    }
    return emptyProductFormState;
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);


  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setProductState({
        ...initialData,
        general: {
          ...initialData.general,
          images: normalizeDisplayImages(initialData.general.images || []),
        },
      });
      setSelectedFiles([]); // Clear any stale selected files
    } else {
      // For create mode, ensure ID is empty or ready for input
      setProductState(prev => ({ ...prev, id: prev.id || '' }));
    }
  }, [initialData, mode]);


  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'create') {
      setProductState(prev => ({ ...prev, id: e.target.value }));
    }
  };

  /** Generic section field updater */
  const handleInputChange = (section: keyof Omit<ProductFormState, 'id' | 'general' | 'specifications' | 'pricing' | 'inventory' | 'additional' | 'seo'> | 'general' | 'pricing' | 'inventory' | 'additional' | 'seo', field: string, value: any) => {
    setProductState((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object), // Type assertion
        [field]: value,
      },
    }));
  };

   const handleGeneralChange = (field: keyof ProductFormState['general'], value: any) => {
    setProductState(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      }
    }));
  };


  /** Spec handlers */
  const handleSpecUpdate = (id: string, field: string, value: string) => {
    setProductState((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        customSpecs: (prev.specifications.customSpecs || []).map((spec) =>
          spec.id === id ? { ...spec, [field]: value } : spec
        ),
      },
    }));
  };
  const handleSpecAdd = (newSpec: { id: string; label: string; value: string; type: string }) => {
    setProductState((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        customSpecs: [...(prev.specifications.customSpecs || []), newSpec],
      },
    }));
  };
  const handleSpecRemove = (id: string) => {
    setProductState((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        customSpecs: (prev.specifications.customSpecs || []).filter(
          (spec) => spec.id !== id
        ),
      },
    }));
  };

  /** Image upload & removal */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImagePreviews = filesArray.map(file => ({
        id: `new-${file.name}-${Date.now()}`, // Unique ID for new file preview
        url: URL.createObjectURL(file),
        name: file.name,
        file: file, // Keep the actual file object
      }));

      setProductState(prev => ({
        ...prev,
        general: {
          ...prev.general,
          images: [...prev.general.images, ...newImagePreviews],
        }
      }));
      setSelectedFiles(prevFiles => [...prevFiles, ...filesArray]);
    }
  };

  const removeImage = (imageIdToRemove: string) => {
    setProductState(prev => ({
      ...prev,
      general: {
        ...prev.general,
        images: prev.general.images.filter(img => img.id !== imageIdToRemove),
      }
    }));
    // If the removed image was a newly selected file, also remove it from selectedFiles
    setSelectedFiles(prevFiles => prevFiles.filter(file => {
      const displayImage = productState.general.images.find(img => img.id === imageIdToRemove);
      return !(displayImage && displayImage.file && displayImage.file.name === file.name && displayImage.url.startsWith('blob:'));
    }));
  };

  const internalOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    // Prepare product data for JSON stringification
    // Exclude file objects from general.images, only include URLs of existing images
    const productDataForJson: Omit<ProductFormState, 'general'> & { general: Omit<ProductFormState['general'], 'images'> & {images: string[]} } = {
      ...productState,
      general: {
        ...productState.general,
        images: productState.general.images
          .filter(img => !img.file) // Only include existing images (not new file blobs)
          .map(img => {
            // Convert full preview URLs back to server-relative paths if they were from initialData
            if (img.url.startsWith(API_BASE_URL || 'http://localhost:5000')) {
              return img.url.substring((API_BASE_URL || 'http://localhost:5000').length);
            }
            return img.url; // Should be a server path already
          }),
      },
    };

    formData.append('productData', JSON.stringify(productDataForJson));

    selectedFiles.forEach(file => {
      formData.append('images', file); // 'images' is the field name backend multer expects
    });

    await onSubmit(formData);
  };


  return (
    <form onSubmit={internalOnSubmit} className="space-y-6">
      {/* --- General Information --- */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">General Information</h3>
        <div className="space-y-6">
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="product-id">Product ID (Unique)*</Label>
              <Input
                id="product-id"
                value={productState.id}
                onChange={handleIdChange}
                required
                placeholder="Enter a unique product ID"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-title">Product Title *</Label>
              <Input
                id="product-title"
                value={productState.general.title}
                onChange={(e) => handleGeneralChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category *</Label>
              <Input
                id="product-category"
                value={productState.general.category}
                onChange={(e) => handleGeneralChange("category", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Description *</Label>
            <Textarea
              id="product-description"
              rows={4}
              value={productState.general.description}
              onChange={(e) => handleGeneralChange("description", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Product Images (Max 10)</Label>
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
              {productState.general.images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url} // This URL is now correctly prefixed for existing or blob for new
                    alt={image.name}
                    className="h-24 w-24 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
           <AddSpecDialog onAdd={handleSpecAdd} />
        </div>

        {(productState.specifications?.customSpecs || []).length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p className="mb-4">No specifications added yet.</p>
             <AddSpecDialog onAdd={handleSpecAdd} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(productState.specifications.customSpecs).map((spec) => (
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
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={productState.pricing.price}
              onChange={(e) => handleInputChange("pricing", "price", parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale Price ($)</Label>
            <Input
              id="salePrice"
              type="number"
              placeholder="0.00"
              value={productState.pricing.salePrice || ""}
              onChange={(e) => handleInputChange("pricing", "salePrice", parseFloat(e.target.value) || null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              value={productState.inventory.quantity}
              onChange={(e) => handleInputChange("inventory", "quantity", parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="e.g. MG-004"
              value={productState.inventory.sku}
              onChange={(e) => handleInputChange("inventory", "sku", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="negotiation"
            checked={productState.pricing.enableNegotiation}
            onCheckedChange={(checked) => handleInputChange("pricing", "enableNegotiation", checked)}
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
              value={productState.additional.tags}
              onChange={(e) => handleInputChange("additional", "tags", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title *</Label>
            <Input
              id="seo-title"
              placeholder="Custom title for search engines"
              value={productState.seo.title}
              onChange={(e) => handleInputChange("seo", "title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-description">SEO Description *</Label>
            <Textarea
              id="seo-description"
              rows={3}
              placeholder="Meta description for search engines"
              value={productState.seo.description}
              onChange={(e) => handleInputChange("seo", "description", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="flex justify-end gap-4 mt-8">
        <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3">
          {mode === 'create' ? 'Save Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
};
