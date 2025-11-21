import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PurchaseTracker } from "@/components/marketing/purchase-tracker";
import { PrintButton } from "@/components/order/print-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

async function getOrder(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          book: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    totalAmount: order.totalAmount.toNumber(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      book: {
        ...item.book,
        price: item.book.price.toNumber(),
        originalPrice: item.book.originalPrice
          ? item.book.originalPrice.toNumber()
          : null,
      },
    })),
  };
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Commande ${orderNumber}`,
    description: "Confirmation de votre commande",
  };
}

export default async function OrderConfirmationPage({
  params,
}: OrderPageProps) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    PENDING: "En attente",
    PROCESSING: "En cours",
    CONFIRMED: "Confirmée",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };

  return (
    <div className="container-custom py-20">
      {/* Track purchase completion */}
      <PurchaseTracker
        orderId={order.orderNumber}
        totalAmount={order.totalAmount}
        items={order.items}
      />

      {/* Success Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-royal-blue mb-4">
          Commande confirmée !
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Merci pour votre commande, {order.customerName}
        </p>
        <p className="text-gray-500">
          Un email de confirmation a été envoyé à{" "}
          <span className="font-medium">{order.customerEmail}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Order Info Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-royal-blue">
                Commande #{order.orderNumber}
              </h2>
              <p className="text-gray-500 mt-1">
                Passée le{" "}
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge
              className={
                statusColors[order.status as keyof typeof statusColors]
              }
            >
              {statusLabels[order.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-royal-blue" />
                <h3 className="font-semibold text-gray-900">
                  Adresse de livraison
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {order.shippingAddress}
                <br />
                {order.shippingCity}
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-5 w-5 text-royal-blue" />
                <h3 className="font-semibold text-gray-900">Contact</h3>
              </div>
              <p className="text-gray-600">
                <span className="block">Téléphone: {order.customerPhone}</span>
                {order.customerEmail && (
                  <span className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {order.customerEmail}
                  </span>
                )}
              </p>
            </div>
          </div>

          {order.observations && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">
                Note de commande
              </h3>
              <p className="text-gray-600">{order.observations}</p>
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
            {order.items.map((item) => {
              const images = item.book.images
                ? typeof item.book.images === "string"
                  ? JSON.parse(item.book.images)
                  : item.book.images
                : [];
              const coverImage =
                Array.isArray(images) && images.length > 0
                  ? images[0]
                  : "/assets/placeholder-book.jpg";

              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="relative w-20 h-28 shrink-0">
                    <Image
                      src={coverImage}
                      alt={item.book.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-royal-blue mb-1">
                      {item.book.title}
                    </h3>
                    {item.book.author && (
                      <p className="text-sm text-gray-600 mb-2">
                        par {item.book.author}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Quantité: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {Number(item.price).toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {Number(item.book.price).toLocaleString("fr-FR")} FCFA /
                      unité
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>
                {Number(order.totalAmount).toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className="text-green-600 font-medium">Gratuite</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-royal-blue pt-2 border-t">
              <span>Total</span>
              <span>
                {Number(order.totalAmount).toLocaleString("fr-FR")} FCFA
              </span>
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
            <Link href="/livre">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
