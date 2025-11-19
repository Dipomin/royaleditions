"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImageSelect: (url: string) => void;
  folder?: string;
  currentImages?: string[];
}

interface UploadedImage {
  url: string;
  key: string;
  size: number;
  name: string;
}

export function ImageUploadModal({
  open,
  onClose,
  onImageSelect,
  folder = "books",
  currentImages = [],
}: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Charger les images existantes du dossier S3
  useEffect(() => {
    if (open) {
      const loadExistingImages = async () => {
        setIsLoadingGallery(true);
        try {
          const response = await fetch(`/api/upload/list?folder=${folder}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.files) {
              const images = data.files.map(
                (file: { url: string; key: string; size: number }) => ({
                  url: file.url,
                  key: file.key,
                  size: file.size,
                  name: file.key.split("/").pop() || "",
                })
              );
              setUploadedImages(images);
            }
          }
        } catch (error) {
          console.error("Erreur chargement galerie:", error);
        } finally {
          setIsLoadingGallery(false);
        }
      };
      loadExistingImages();
    }
  }, [open, folder]);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Erreur d'upload");
          }

          return await response.json();
        });

        const results = await Promise.all(uploadPromises);

        setUploadedImages((prev) => [...prev, ...results]);

        toast.success(
          `${results.length} image${results.length > 1 ? "s" : ""} uploadée${
            results.length > 1 ? "s" : ""
          } avec succès`
        );
      } catch (error) {
        console.error("Erreur upload:", error);
        toast.error(
          error instanceof Error ? error.message : "Erreur lors de l'upload"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [folder]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleDelete = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setUploadedImages((prev) => prev.filter((img) => img.url !== imageUrl));
      toast.success("Image supprimée");
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSelect = (url: string) => {
    onImageSelect(url);
    onClose();
  };

  const allImages = [
    ...uploadedImages,
    ...currentImages
      .filter((url) => url && url.trim())
      .map((url) => ({
        url,
        key: url,
        size: 0,
        name: url.split("/").pop() || "",
      })),
  ].filter((img) => img.url && img.url.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-royal-blue">
            Gestionnaire d&apos;Images
          </DialogTitle>
          <DialogDescription>
            Uploadez de nouvelles images ou sélectionnez une image existante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Zone de drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-gold bg-gold/5"
                : "border-gray-300 hover:border-gold"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />

            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-3"
            >
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-gold animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gold" />
              )}

              <div>
                <p className="font-medium text-gray-700">
                  {isUploading
                    ? "Upload en cours..."
                    : "Cliquez pour uploader ou glissez vos images ici"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, WEBP, GIF jusqu&apos;à 5MB
                </p>
              </div>
            </label>
          </div>

          {/* Galerie d'images */}
          {isLoadingGallery ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span className="ml-2 text-gray-600">
                Chargement des images...
              </span>
            </div>
          ) : allImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune image disponible. Uploadez votre première image.</p>
            </div>
          ) : null}

          {allImages.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Images ({allImages.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allImages.map((img, index) => (
                  <div
                    key={img.key + index}
                    className="relative group border rounded-lg overflow-hidden bg-gray-50 aspect-square"
                  >
                    <Image
                      src={img.url}
                      alt={img.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />

                    {/* Overlay avec actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                      <Button
                        size="sm"
                        onClick={() => handleSelect(img.url)}
                        className="bg-gold hover:bg-gold-dark"
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Sélectionner
                      </Button>

                      {uploadedImages.some((u) => u.url === img.url) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(img.url)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      )}
                    </div>

                    {/* Info taille */}
                    {img.size > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                        {(img.size / 1024).toFixed(0)} KB
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {allImages.length === 0 && !isUploading && (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-16 w-16 mx-auto mb-3 text-gray-300" />
              <p>Aucune image. Uploadez-en une pour commencer.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
