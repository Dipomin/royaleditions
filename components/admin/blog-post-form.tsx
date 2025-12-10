"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadModal } from "@/components/admin/image-upload-modal";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, X } from "lucide-react";

type BlogPostFormInput = {
  title: string;
  content: string;
  author: string;
  published: boolean;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export function BlogPostForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogPostFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(blogPostSchema) as any,
    defaultValues: {
      author: "Royal Editions",
      published: false,
    },
  });

  const onSubmit = async (data: BlogPostFormInput) => {
    try {
      setIsLoading(true);

      const postData = {
        ...data,
        content,
        published: data.published || false,
        coverImage: coverImageUrl || data.coverImage || undefined,
      };

      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error("Erreur lors de la création");

      toast.success("Article créé avec succès !");
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de l'article");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-royal-blue">
              Informations de l&apos;Article
            </h2>

            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Le titre de votre article"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="excerpt">Extrait *</Label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                placeholder="Court extrait de l'article (150-200 caractères)"
                rows={3}
              />
              {errors.excerpt && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.excerpt.message}
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
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-xl font-bold text-royal-blue mb-4">
              Contenu de l&apos;Article *
            </h2>
            <RichTextEditor content={content} onChange={setContent} />
            {!content && (
              <p className="text-sm text-red-600 mt-2">Le contenu est requis</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-royal-blue">
              Publication
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                {...register("published")}
                className="w-4 h-4 text-gold rounded"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publier immédiatement
              </Label>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Si non publié, l&apos;article sera sauvegardé comme brouillon
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-royal-blue">
              Image de Couverture
            </h2>

            {/* Prévisualisation de l'image */}
            {coverImageUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={coverImageUrl}
                  alt="Couverture"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg"
                  title="Retirer l'image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Bouton de sélection */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImageModalOpen(true)}
              className="w-full border-2 border-dashed border-gray-300 hover:border-gold hover:bg-gold/5"
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              {coverImageUrl ? "Changer l'image" : "Sélectionner une image"}
            </Button>

            {/* Input manuel optionnel */}
            <div>
              <Label htmlFor="coverImage" className="text-xs text-gray-600">
                Ou saisir une URL manuellement
              </Label>
              <Input
                id="coverImage"
                {...register("coverImage")}
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dimensions recommandées : 1200x630px
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-royal-blue">
              SEO
            </h2>

            <div>
              <Label htmlFor="metaTitle">Meta Titre</Label>
              <Input
                id="metaTitle"
                {...register("metaTitle")}
                placeholder="Titre pour les moteurs de recherche"
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                {...register("metaDescription")}
                placeholder="Description pour les moteurs de recherche"
                rows={3}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="btn-gold w-full"
              disabled={isLoading || !content}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer l&apos;article
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="w-full"
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de sélection d'images */}
      <ImageUploadModal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={(url) => {
          setCoverImageUrl(url);
          setIsImageModalOpen(false);
        }}
        folder="blog-covers"
        currentImages={coverImageUrl ? [coverImageUrl] : []}
      />
    </form>
  );
}
