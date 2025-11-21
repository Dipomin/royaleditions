"use client";

import { useCart } from "@/lib/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCart();
  const total = getTotalPrice();
  const itemCount = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 lg:max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 mb-8">
            Découvrez notre collection de livres et ajoutez vos favoris
          </p>
          <Button size="lg" className="btn-royal-blue" asChild>
            <Link href="/livre">
              Explorer la boutique
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-20 lg:max-w-7xl mx-auto">
      <h1 className="font-heading text-4xl font-bold text-royal-blue mb-8">
        Panier ({itemCount} {itemCount > 1 ? "articles" : "article"})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-lg shadow-sm p-6 flex gap-6"
            >
              <Link
                href={`/livre/${item.slug}`}
                className="relative w-24 h-32 shrink-0"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/livre/${item.slug}`}>
                    <h3 className="font-heading text-lg font-semibold hover:text-royal-blue transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xl font-bold text-royal-blue mt-2">
                    {item.price.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="font-heading text-2xl font-bold text-royal-blue mb-6">
              Récapitulatif
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">
                  {total.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="font-semibold text-green-600">À calculer</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold text-royal-blue">
                <span>Total</span>
                <span>{total.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>

            <Button size="lg" className="w-full btn-gold" asChild>
              <Link href="/commander">
                Passer la commande
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" className="w-full mt-3" asChild>
              <Link href="/livre">Continuer mes achats</Link>
            </Button>

            <div className="mt-6 p-4 bg-gold/10 rounded-lg">
              <p className="text-sm text-royal-blue font-medium">
                💳 Paiement à la livraison
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Payez en espèces lors de la réception de votre commande
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
