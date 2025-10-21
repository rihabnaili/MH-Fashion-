'use client';

import React, { useState } from 'react';
import { X, Upload, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadManagerProps {
  images: File[];
  existingImages?: string[];
  onImagesChange: (images: File[]) => void;
  onExistingImagesChange?: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploadManager({
  images,
  existingImages = [],
  onImagesChange,
  onExistingImagesChange,
  maxImages = 10
}: ImageUploadManagerProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const totalImages = images.length + newImages.length;
      
      if (totalImages <= maxImages) {
        onImagesChange([...images, ...newImages]);
      } else {
        alert(`Vous ne pouvez pas ajouter plus de ${maxImages} images au total.`);
      }
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    if (onExistingImagesChange) {
      onExistingImagesChange(existingImages.filter((_, i) => i !== index));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newImages = Array.from(e.dataTransfer.files);
      const totalImages = images.length + newImages.length;
      
      if (totalImages <= maxImages) {
        onImagesChange([...images, ...newImages]);
      } else {
        alert(`Vous ne pouvez pas ajouter plus de ${maxImages} images au total.`);
      }
    }
  };

  const totalImages = images.length + existingImages.length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
          dragActive
            ? 'border-gold bg-gold/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          Glissez-déposez vos images ici ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-gray-500">
          {totalImages} / {maxImages} images ({images.length} nouvelles, {existingImages.length} existantes)
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-block mt-2 px-3 sm:px-4 py-2 sm:py-3 bg-gold text-black rounded-lg hover:bg-yellow-500 transition-colors cursor-pointer text-xs sm:text-sm"
        >
          Sélectionner des Images
        </label>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Images existantes</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative group">
                <div className="w-full h-20 sm:h-24 lg:h-28 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${t("existingImage")} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-600 transition-all duration-200"
                    title={t("removeImage")}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black/50 text-white text-xs px-1 sm:px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images */}
      {images.length > 0 && (
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Nouvelles images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {images.map((image, index) => (
              <div key={`new-${index}`} className="relative group">
                <div className="w-full h-20 sm:h-24 lg:h-28 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`${t("newImage")} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-600 transition-all duration-200"
                    title={t("removeImage")}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-green-500 text-white text-xs px-1 sm:px-2 py-1 rounded">
                  Nouveau
                </div>
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/50 text-white text-xs px-1 sm:px-2 py-1 rounded">
                  {existingImages.length + index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Order Info */}
      {totalImages > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-blue-700">
            💡 <strong>Conseil :</strong> L&apos;ordre des images est important.
            La première image sera l&apos;image principale du produit.
          </p>
        </div>
      )}
    </div>
  );
}
