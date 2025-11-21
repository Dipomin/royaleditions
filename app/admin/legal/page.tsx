"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
}

export default function LegalPagesAdmin() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cgv" | "confidentialite">("cgv");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/legal");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Erreur lors du chargement des pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slug: string) => {
    setSaving(slug);
    try {
      const page = pages.find((p) => p.slug === slug);
      if (!page) return;

      const response = await fetch(`/api/legal/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          content: page.content,
          published: page.published,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      toast.success("Page mise à jour avec succès");
      fetchPages();
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(null);
    }
  };

  const updatePage = (
    slug: string,
    field: keyof LegalPage,
    value: string | boolean
  ) => {
    setPages((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, [field]: value } : p))
    );
  };

  const currentPage = pages.find((p) => p.slug === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-royal-blue">
            Pages Légales
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les conditions générales de vente et la politique de
            confidentialité
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("cgv")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "cgv"
              ? "border-royal-blue text-royal-blue"
              : "border-transparent text-gray-600 hover:text-royal-blue"
          }`}
        >
          <FileText className="inline-block h-4 w-4 mr-2" />
          Conditions Générales de Vente
        </button>
        <button
          onClick={() => setActiveTab("confidentialite")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "confidentialite"
              ? "border-royal-blue text-royal-blue"
              : "border-transparent text-gray-600 hover:text-royal-blue"
          }`}
        >
          <FileText className="inline-block h-4 w-4 mr-2" />
          Politique de Confidentialité
        </button>
      </div>

      {currentPage ? (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la page</Label>
              <Input
                id="title"
                value={currentPage.title}
                onChange={(e) =>
                  updatePage(currentPage.slug, "title", e.target.value)
                }
                placeholder="Ex: Conditions Générales de Vente"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Contenu de la page</Label>
              <RichTextEditor
                content={currentPage.content}
                onChange={(content) =>
                  updatePage(currentPage.slug, "content", content)
                }
              />
            </div>

            {/* Published Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={currentPage.published}
                onChange={(e) =>
                  updatePage(currentPage.slug, "published", e.target.checked)
                }
                className="h-4 w-4 text-royal-blue rounded border-gray-300 focus:ring-royal-blue"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Page publiée (visible sur le site)
              </Label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handleSave(currentPage.slug)}
                disabled={saving === currentPage.slug}
                className="btn-royal-blue"
              >
                {saving === currentPage.slug ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            Aucune page trouvée. Les pages seront créées automatiquement.
          </p>
        </Card>
      )}
    </div>
  );
}
