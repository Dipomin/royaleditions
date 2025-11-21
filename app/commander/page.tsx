"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema } from "@/lib/validations";
import { trackEvent } from "@/components/marketing/analytics-scripts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";

type OrderFormData = z.infer<typeof orderSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = getTotalPrice();

  // Track checkout initiation when component mounts
  useEffect(() => {
    if (items.length > 0) {
      trackEvent.initiateCheckout(total, items.length);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  if (items.length === 0) {
    return (
      <div className="container-custom py-20">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 mb-8">
            Ajoutez des articles à votre panier avant de passer commande
          </p>
          <Button size="lg" className="btn-royal-blue" asChild>
            <Link href="/boutique">Explorer la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: data,
          items: items,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la commande");

      const order = await response.json();

      clearCart();
      toast.success("Commande passée avec succès!");
      router.push(`/commande/${order.orderNumber}`);
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-20 lg:max-w-7xl mx-4 lg:mx-auto">
      <h1 className="font-heading text-4xl font-bold text-royal-blue mb-8">
        Finaliser la commande
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-heading text-2xl font-semibold mb-6">
              Informations de livraison
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  placeholder="Ex: Kouassi Jean"
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="customerPhone">
                  Téléphone (10 chiffres){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                    +225
                  </span>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder="0123456789"
                    maxLength={10}
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-sm text-red-500">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email (optionnel)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail")}
                  placeholder="exemple@email.com"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="shippingCity">
                  Ville <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="shippingCity"
                  {...register("shippingCity")}
                  placeholder="Ex: Abidjan"
                />
                {errors.shippingCity && (
                  <p className="text-sm text-red-500">
                    {errors.shippingCity.message}
                  </p>
                )}
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label htmlFor="shippingArea">
                  Quartier <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="shippingArea"
                  {...register("shippingArea")}
                  placeholder="Ex: Cocody"
                />
                {errors.shippingArea && (
                  <p className="text-sm text-red-500">
                    {errors.shippingArea.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">
                  Adresse complète <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="shippingAddress"
                  {...register("shippingAddress")}
                  placeholder="Ex: Rue principale, à côté de la pharmacie..."
                  rows={3}
                />
                {errors.shippingAddress && (
                  <p className="text-sm text-red-500">
                    {errors.shippingAddress.message}
                  </p>
                )}
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <Label htmlFor="observations">Observations (optionnel)</Label>
                <Textarea
                  id="observations"
                  {...register("observations")}
                  placeholder="Instructions spéciales de livraison..."
                  rows={3}
                />
              </div>

              {/* CGV Acceptance */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptCGV"
                    {...register("acceptCGV")}
                    className="h-4 w-4 mt-1 text-royal-blue rounded border-gray-300 focus:ring-royal-blue"
                  />
                  <Label htmlFor="acceptCGV" className="cursor-pointer text-sm">
                    J&apos;accepte les{" "}
                    <Link
                      href="/conditions-generales"
                      target="_blank"
                      className="text-royal-blue hover:text-gold underline"
                    >
                      conditions générales de vente
                    </Link>{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                </div>
                {errors.acceptCGV && (
                  <p className="text-sm text-red-500">
                    {errors.acceptCGV.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full btn-gold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="font-heading text-2xl font-semibold text-royal-blue mb-6">
              Votre commande
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-20 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.quantity} × {item.price.toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">
                  {total.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-royal-blue">
                <span>Total</span>
                <span>{total.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gold/10 rounded-lg">
              <p className="text-sm font-semibold text-royal-blue mb-2">
                💳 Paiement à la livraison
              </p>
              <p className="text-xs text-gray-600">
                Vous paierez en espèces lors de la réception de votre commande.
                Notre livreur vous contactera pour confirmer l&apos;adresse.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
