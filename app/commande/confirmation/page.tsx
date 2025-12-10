"use client";

import { useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, Phone, Mail, Home } from "lucide-react";
import { PrintButton } from "@/components/order/print-button";

// Déclarer gtag pour TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingCity: string;
  shippingArea: string;
  shippingAddress: string;
  observations?: string;
  totalAmount: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

// Fonctions pour useSyncExternalStore
const subscribe = () => () => {};

const getSnapshot = (): OrderData | null => {
  if (typeof window === "undefined") return null;
  const storedOrder = sessionStorage.getItem("lastOrder");
  if (storedOrder) {
    try {
      return JSON.parse(storedOrder);
    } catch {
      console.error("Erreur lors de la lecture des données de commande");
      return null;
    }
  }
  return null;
};

const getServerSnapshot = (): OrderData | null => null;

export default function OrderConfirmationPage() {
  const orderData = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const isLoading = false;

  // Google Ads Conversion Tracking
  useEffect(() => {
    if (orderData && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "AW-17785014589/ERBuCO6MrM8bEL2Sx6BC",
        transaction_id: orderData.orderNumber,
      });
    }
  }, [orderData]);

  if (isLoading) {
    return (
      <div className="container-custom py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si pas de données, afficher un message générique de succès
  if (!orderData) {
    return (
      <div className="container-custom py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-royal-blue mb-4">
            Merci pour votre commande !
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre commande a été enregistrée avec succès.
          </p>

          <Card className="p-6 bg-blue-50 border-blue-200 text-left max-w-xl mx-auto mb-8">
            <h3 className="font-semibold text-royal-blue mb-4">
              Prochaines étapes
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  Vous recevrez un appel de confirmation de notre équipe dans
                  les 24h
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>La livraison sera effectuée sous 2-5 jours ouvrés</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>
                  Le paiement se fait à la livraison (en espèces ou par mobile
                  money)
                </span>
              </li>
            </ul>
          </Card>

          <Button size="lg" className="btn-royal-blue" asChild>
            <Link href="/boutique">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-20">
      {/* Success Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-royal-blue mb-4">
          Commande confirmée !
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Merci pour votre commande, {orderData.customerName}
        </p>
        {orderData.customerEmail && (
          <p className="text-gray-500">
            Un email de confirmation a été envoyé à{" "}
            <span className="font-medium">{orderData.customerEmail}</span>
          </p>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Order Info Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-royal-blue">
                Commande #{orderData.orderNumber}
              </h2>
              <p className="text-gray-500 mt-1">
                Passée le{" "}
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              En attente
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-royal-blue" />
                <h3 className="font-semibold text-gray-900">
                  Adresse de livraison
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {orderData.shippingAddress}
                <br />
                {orderData.shippingArea}, {orderData.shippingCity}
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-5 w-5 text-royal-blue" />
                <h3 className="font-semibold text-gray-900">Contact</h3>
              </div>
              <p className="text-gray-600">
                <span className="block">
                  Téléphone: +225 {orderData.customerPhone}
                </span>
                {orderData.customerEmail && (
                  <span className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {orderData.customerEmail}
                  </span>
                )}
              </p>
            </div>
          </div>

          {orderData.observations && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">
                Note de commande
              </h3>
              <p className="text-gray-600">{orderData.observations}</p>
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-6 w-6 text-royal-blue" />
            <h2 className="font-heading text-2xl font-semibold text-royal-blue">
              Articles commandés
            </h2>
          </div>

          <div className="space-y-4">
            {orderData.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-royal-blue mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quantité: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString("fr-FR")} FCFA
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.price.toLocaleString("fr-FR")} FCFA / unité
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{orderData.totalAmount.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className="text-green-600 font-medium">Gratuite</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-royal-blue pt-2 border-t">
              <span>Total</span>
              <span>{orderData.totalAmount.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-royal-blue mb-4">
            Prochaines étapes
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>
                Vous recevrez un appel de confirmation de notre équipe dans les
                24h
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>La livraison sera effectuée sous 2-5 jours ouvrés</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>
                Le paiement se fait à la livraison (en espèces ou par mobile
                money)
              </span>
            </li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrintButton />
          <Button size="lg" className="btn-royal-blue" asChild>
            <Link href="/boutique">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
