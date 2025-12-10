"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadModal } from "@/components/admin/image-upload-modal";
import { toast } from "sonner";
import { Loader2, ImagePlus, X } from "lucide-react";
import { parseBookImages } from "@/lib/utils/parse-images";

interface Category {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  summary: string | null;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  stock: number;
  images: string;
  featured: boolean;
  bestseller: boolean;
  categoryId: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

interface BookFormProps {
  categories: Category[];
  book?: Book | null;
}

type BookFormInput = {
  title: string;
  author: string;
  summary: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  featured: boolean;
  bestseller: boolean;
  originalPrice?: number;
  images?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export function BookForm({ categories, book }: BookFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState(book?.description || "");
  const [isMounted, setIsMounted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [bookImages, setBookImages] = useState<string[]>(() => {
    if (book?.images) {
      return parseBookImages(book.images);
    }
    return [];
  });

  // Parse existing images pour les defaultValues
  const getImagesString = () => {
    if (!book?.images) return "";
    const parsed = parseBookImages(book.images);
    return parsed.join(",");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bookSchema) as any,
    defaultValues: {
      title: book?.title || "",
      author: book?.author || "",
      summary: book?.summary || "",
      description: book?.description || "",
      price: book?.price || 0,
      originalPrice: book?.originalPrice || undefined,
      stock: book?.stock || 0,
      categoryId: book?.categoryId || "",
      featured: book?.featured || false,
      bestseller: book?.bestseller || false,
      images: getImagesString(),
      metaTitle: book?.metaTitle || "",
      metaDescription: book?.metaDescription || "",
    },
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Erreurs de validation:", errors);
      toast.error("Veuillez corriger les erreurs du formulaire");
    }
  }, [errors]);

  // Synchroniser description avec le formulaire
  useEffect(() => {
    setValue("description", description);
  }, [description, setValue]);

  // Synchroniser bookImages avec le formulaire
  useEffect(() => {
    setValue("images", bookImages.join(","));
  }, [bookImages, setValue]);

  const onSubmit = async (data: BookFormInput) => {
    try {
      setIsLoading(true);

      const bookData = {
        ...data,
        images: data.images
          ? data.images.split(",").filter((url) => url.trim())
          : [],
      };

      console.log("Données envoyées:", bookData);

      const url = book ? `/api/books/${book.id}` : "/api/books";
      const method = book ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur API:", errorData);
        throw new Error(
          errorData.error ||
            `Erreur lors de ${
              book ? "la modification" : "la création"
            } du livre`
        );
      }

      toast.success(`Livre ${book ? "modifié" : "créé"} avec succès !`);
      router.push("/admin/livres");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Erreur lors de ${
              book ? "la modification" : "la création"
            } du livre`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-royal-blue">
            Informations Générales
          </h2>

          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Le titre du livre"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="author">Auteur *</Label>
            <Input
              id="author"
              {...register("author")}
              placeholder="Nom de l'auteur"
            />
            {errors.author && (
              <p className="text-sm text-red-600 mt-1">
                {errors.author.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="summary">Résumé *</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Court résumé du livre (150-200 caractères)"
              rows={3}
            />
            {errors.summary && (
              <p className="text-sm text-red-600 mt-1">
                {errors.summary.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="categoryId">Catégorie *</Label>
            {!isMounted ? (
              <div className="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-3 py-2 text-sm text-muted-foreground">
                Chargement...
              </div>
            ) : (
              <Select
                onValueChange={(value) => setValue("categoryId", value)}
                defaultValue={book?.categoryId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.categoryId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-royal-blue">
            Prix & Stock
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="15000"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="originalPrice">Prix Original (FCFA)</Label>
              <Input
                id="originalPrice"
                type="number"
                {...register("originalPrice", { valueAsNumber: true })}
                placeholder="Prix avant réduction"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              {...register("stock", { valueAsNumber: true })}
              placeholder="50"
            />
            {errors.stock && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stock.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="w-4 h-4 text-gold rounded"
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Mettre en avant
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bestseller"
                {...register("bestseller")}
                className="w-4 h-4 text-gold rounded"
              />
              <Label htmlFor="bestseller" className="cursor-pointer">
                Marquer comme Bestseller
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="images">Images du Livre</Label>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageModal(true)}
                className="w-full border-dashed"
              >
                <ImagePlus className="h-5 w-5 mr-2" />
                Ajouter des images
              </Button>

              {bookImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {bookImages.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border rounded-lg overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = bookImages.filter(
                            (_, i) => i !== index
                          );
                          setBookImages(newImages);
                          setValue("images", newImages.join(","));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="hidden"
                {...register("images")}
                value={bookImages.join(",")}
              />

              <p className="text-xs text-gray-500">
                Ajoutez une ou plusieurs images pour ce livre
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageSelect={(url) => {
          const newImages = [...bookImages, url];
          setBookImages(newImages);
          setValue("images", newImages.join(","));
          toast.success("Image ajoutée");
        }}
        folder="books"
        currentImages={bookImages}
      />

      <Card className="p-6">
        <h2 className="font-heading text-xl font-bold text-royal-blue mb-4">
          Description Complète *
        </h2>
        <RichTextEditor content={description} onChange={setDescription} />
        {!description && (
          <p className="text-sm text-red-600 mt-2">
            La description est requise
          </p>
        )}
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="btn-gold"
          disabled={isLoading || !description}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Créer le livre
        </Button>
      </div>
    </form>
  );
}
