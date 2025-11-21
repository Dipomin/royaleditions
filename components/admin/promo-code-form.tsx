"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .regex(
      /^[A-Z0-9]+$/,
      "Seules les lettres majuscules et chiffres sont autorisés"
    ),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.string().min(1, "La valeur de réduction est requise"),
  minAmount: z.string().optional(),
  maxUses: z.string().optional(),
  expiresAt: z.string().optional(),
  active: z.boolean(),
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

interface PromoCodeFormProps {
  initialData?: {
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    minAmount: number | null;
    maxUses: number | null;
    expiresAt: string | null;
    active: boolean;
  };
}

export function PromoCodeForm({ initialData }: PromoCodeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          description: initialData.description || "",
          discountType: initialData.discountType as "percentage" | "fixed",
          discountValue: initialData.discountValue.toString(),
          minAmount: initialData.minAmount?.toString() || "",
          maxUses: initialData.maxUses?.toString() || "",
          expiresAt: initialData.expiresAt
            ? new Date(initialData.expiresAt).toISOString().split("T")[0]
            : "",
          active: initialData.active,
        }
      : {
          discountType: "percentage",
          active: true,
        },
  });

  const discountType = watch("discountType");

  const onSubmit = async (data: PromoCodeFormData) => {
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/promo/${initialData.id}` : "/api/promo";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      toast.success(
        isEditing
          ? "Code promo mis à jour avec succès"
          : "Code promo créé avec succès"
      );

      router.push("/admin/promo");
      router.refresh();
    } catch (error) {
      console.error("Error saving promo code:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/promo">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-heading font-bold text-royal-blue">
          {isEditing ? "Modifier le code promo" : "Nouveau code promo"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Code */}
            <div>
              <Label htmlFor="code">
                Code promo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="ROYAL2024"
                className="uppercase"
                maxLength={20}
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.code.message}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Majuscules et chiffres uniquement, sans espaces
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Ex: Promotion de Noël, Offre de lancement..."
                rows={3}
              />
            </div>

            {/* Type de réduction */}
            <div>
              <Label htmlFor="discountType">
                Type de réduction <span className="text-red-500">*</span>
              </Label>
              <Select
                value={discountType}
                onValueChange={(value) =>
                  setValue("discountType", value as "percentage" | "fixed")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                </SelectContent>
              </Select>
              {errors.discountType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.discountType.message}
                </p>
              )}
            </div>

            {/* Valeur de réduction */}
            <div>
              <Label htmlFor="discountValue">
                Valeur de réduction <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="discountValue"
                  type="number"
                  {...register("discountValue")}
                  placeholder={discountType === "percentage" ? "10" : "5000"}
                  step={discountType === "percentage" ? "1" : "100"}
                  min="0"
                  max={discountType === "percentage" ? "100" : undefined}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {discountType === "percentage" ? "%" : "FCFA"}
                </span>
              </div>
              {errors.discountValue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.discountValue.message}
                </p>
              )}
            </div>

            {/* Montant minimum */}
            <div>
              <Label htmlFor="minAmount">
                Montant minimum de commande (optionnel)
              </Label>
              <div className="relative">
                <Input
                  id="minAmount"
                  type="number"
                  {...register("minAmount")}
                  placeholder="Ex: 10000"
                  step="100"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  FCFA
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Le code sera valide uniquement pour les commandes supérieures à
                ce montant
              </p>
            </div>

            {/* Nombre max d'utilisations */}
            <div>
              <Label htmlFor="maxUses">
                Nombre maximum d&apos;utilisations (optionnel)
              </Label>
              <Input
                id="maxUses"
                type="number"
                {...register("maxUses")}
                placeholder="Ex: 100"
                min="1"
              />
              <p className="text-gray-500 text-xs mt-1">
                Laisser vide pour un nombre illimité
              </p>
            </div>

            {/* Date d'expiration */}
            <div>
              <Label htmlFor="expiresAt">
                Date d&apos;expiration (optionnel)
              </Label>
              <Input
                id="expiresAt"
                type="date"
                {...register("expiresAt")}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-gray-500 text-xs mt-1">
                Laisser vide si le code n&apos;expire jamais
              </p>
            </div>

            {/* Statut actif */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                {...register("active")}
                className="h-4 w-4 rounded border-gray-300 text-royal-blue focus:ring-royal-blue"
              />
              <Label htmlFor="active" className="cursor-pointer">
                Code promo actif
              </Label>
            </div>
          </div>
        </Card>

        {/* Boutons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold hover:bg-gold-dark text-royal-blue font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : isEditing ? (
              "Mettre à jour"
            ) : (
              "Créer le code promo"
            )}
          </Button>
          <Link href="/admin/promo">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
