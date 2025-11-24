"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Minus, Tag, X, ShoppingBag } from "lucide-react";

// Schéma de validation simplifié pour commande directe
const directOrderSchema = z.object({
  customerName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  customerPhone: z
    .string()
    .regex(/^[0-9]{10}$/, "Le numéro doit contenir exactement 10 chiffres"),
  shippingCity: z.string().min(2, "La ville ou commune est requise"),
  observations: z.string().optional(),
});

type DirectOrderFormData = z.infer<typeof directOrderSchema>;

interface DirectOrderFormProps {
  book: {
    id: string;
    title: string;
    price: number;
    stock: number;
  };
}

interface PromoCodeData {
  valid: boolean;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  description?: string;
}

export function DirectOrderForm({ book }: DirectOrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeData | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DirectOrderFormData>({
    resolver: zodResolver(directOrderSchema),
  });

  // Calculs en temps réel
  const subtotal = book.price * quantity;
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  // Gérer l'augmentation de quantité
  const increaseQuantity = () => {
    if (quantity < book.stock) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Stock maximum disponible: ${book.stock}`);
    }
  };

  // Gérer la diminution de quantité
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Valider le code promo
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Veuillez saisir un code promo");
      return;
    }

    setIsValidatingPromo(true);

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          orderAmount: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Code promo invalide");
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(data);
      toast.success("Code promo appliqué avec succès !", {
        description:
          data.description ||
          `Réduction de ${data.discountAmount.toLocaleString("fr-FR")} FCFA`,
      });
    } catch (error) {
      console.error("Promo validation error:", error);
      toast.error("Erreur lors de la validation du code promo");
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Retirer le code promo
  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
    toast.info("Code promo retiré");
  };

  // Recalculer la réduction si la quantité change
  useEffect(() => {
    if (appliedPromo) {
      // Revalider le code promo avec le nouveau montant
      const revalidate = async () => {
        try {
          const response = await fetch("/api/promo/validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: appliedPromo.code,
              orderAmount: subtotal,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setAppliedPromo(data);
          } else {
            // Si le code n'est plus valide, le retirer
            setAppliedPromo(null);
            setPromoCode("");
            toast.error(data.error || "Le code promo n'est plus valide");
          }
        } catch (error) {
          console.error("Promo revalidation error:", error);
        }
      };

      revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const onSubmit = async (data: DirectOrderFormData) => {
    if (book.stock < quantity) {
      toast.error("Stock insuffisant");
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer la commande
      const orderData = {
        items: [
          {
            id: book.id,
            quantity: quantity,
            price: book.price,
          },
        ],
        customer: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          shippingCity: data.shippingCity,
          shippingArea: data.shippingCity,
          shippingAddress: data.shippingCity,
          observations: data.observations || "",
        },
        promoCode: appliedPromo?.code || null,
        discount: discount,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la commande");
      }

      const order = await response.json();

      toast.success("Commande créée avec succès !", {
        description: `Numéro de commande: ${order.orderNumber}`,
      });

      // Rediriger vers la page de confirmation
      router.push(`/commande/${order.orderNumber}`);
      reset();
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Erreur lors de la création de la commande", {
        description: "Veuillez réessayer plus tard",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Sélecteur de quantité et résumé de prix */}
      <div className="bg-white p-6 rounded-xl border-2 border-royal-blue/20 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-royal-blue mb-4">
          Résumé de la commande
        </h3>

        {/* Quantité */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Quantité</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-royal-blue">
                {quantity}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                / {book.stock} disponible{book.stock > 1 ? "s" : ""}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={increaseQuantity}
              disabled={quantity >= book.stock}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calculs */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Sous-total ({quantity} × {book.price.toLocaleString("fr-FR")}{" "}
              FCFA)
            </span>
            <span className="font-medium">
              {subtotal.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          {appliedPromo && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction ({appliedPromo.code})</span>
              <span className="font-medium">
                -{discount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-royal-blue pt-2 border-t">
            <span>Total</span>
            <span>{total.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>
      </div>

      {/* Code promo */}
      <div className="bg-gold/10 p-5 rounded-xl border border-gold/30">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-5 w-5 text-gold" />
          <h3 className="font-semibold text-royal-blue">Code promotionnel</h3>
        </div>

        {appliedPromo ? (
          <div className="bg-white p-4 rounded-lg border border-green-300 flex items-center justify-between">
            <div>
              <p className="font-bold text-green-700">{appliedPromo.code}</p>
              {appliedPromo.description && (
                <p className="text-sm text-gray-600">
                  {appliedPromo.description}
                </p>
              )}
              <p className="text-sm font-medium text-green-600 mt-1">
                Économie: {discount.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removePromoCode}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Entrez votre code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 uppercase"
              disabled={isValidatingPromo}
            />
            <Button
              type="button"
              onClick={validatePromoCode}
              disabled={isValidatingPromo || !promoCode.trim()}
              className="bg-royal-blue hover:bg-royal-blue/90 text-white"
            >
              {isValidatingPromo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Appliquer"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Informations de livraison */}
      <div className="bg-royal-blue/5 p-6 rounded-lg border border-royal-blue/10">
        <h3 className="font-heading text-lg font-semibold text-royal-blue mb-4">
          Informations de livraison
        </h3>

        <div className="space-y-4">
          {/* Nom complet */}
          <div>
            <Label htmlFor="customerName" className="text-sm font-medium">
              Nom et prénoms <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Ex: Kouassi Jean-Marc"
              {...register("customerName")}
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerName.message}
              </p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <Label htmlFor="customerPhone" className="text-sm font-medium">
              Numéro de téléphone <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-3 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700">
                +225
              </div>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="0123456789"
                maxLength={10}
                {...register("customerPhone")}
                className={errors.customerPhone ? "border-red-500" : ""}
              />
            </div>
            {errors.customerPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customerPhone.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              10 chiffres sans espace
            </p>
          </div>

          {/* Ville */}
          <div>
            <Label htmlFor="shippingCity" className="text-sm font-medium">
              Adresse de livraison <span className="text-red-500">*</span>
            </Label>
            <Input
              id="shippingCity"
              type="text"
              placeholder="Ex: Abidjan, Yamoussoukro, Bouaké..."
              {...register("shippingCity")}
              className={errors.shippingCity ? "border-red-500" : ""}
            />
            {errors.shippingCity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.shippingCity.message}
              </p>
            )}
          </div>

          {/* Note de commande */}
          <div>
            <Label htmlFor="observations" className="text-sm font-medium">
              Note de commande{" "}
              <span className="text-gray-400">(optionnel)</span>
            </Label>
            <Textarea
              id="observations"
              placeholder="Informations complémentaires, point de repère, horaires préférés..."
              rows={3}
              {...register("observations")}
              className="resize-none"
            />
            {errors.observations && (
              <p className="text-red-500 text-sm mt-1">
                {errors.observations.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
      <Button
        type="submit"
        disabled={isSubmitting || book.stock < 1}
        className="w-full bg-gold hover:bg-gold-dark text-royal-blue font-semibold py-6 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Validation en cours...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Valider la commande | {total.toLocaleString("fr-FR")} FCFA
          </>
        )}
      </Button>

      {book.stock < 1 && (
        <p className="text-red-500 text-sm text-center">
          Ce livre n&apos;est plus disponible en stock
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        En validant, vous acceptez nos{" "}
        <a href="/conditions-generales" className="underline">
          conditions générales de vente
        </a>
      </p>
    </form>
  );
}
