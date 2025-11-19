"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: {
    books: number;
  };
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur lors de la création");

      const newCategory = await res.json();
      setCategories([newCategory, ...categories]);
      setFormData({ name: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Catégorie créée avec succès !");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de la catégorie");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-royal-blue">
            Gestion des Catégories
          </h1>
          <p className="text-gray-600">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-royal-blue">
                Créer une catégorie
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Développement Personnel"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description de la catégorie..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" className="btn-gold" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Créer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-heading text-lg font-bold text-royal-blue">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Slug: <span className="font-mono">{category.slug}</span>
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {category.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                {category._count?.books || 0} livre
                {(category._count?.books || 0) > 1 ? "s" : ""}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
