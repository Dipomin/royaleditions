"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, Package } from "lucide-react";

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string;
    shippingAddress: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      book: {
        id: string;
        title: string;
        author: string;
        images: unknown;
      };
    }>;
  };
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      setStatus(newStatus);
      toast.success("Statut mis à jour avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "PENDING":
        return "bg-orange-100 text-orange-700";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "PENDING":
        return "En attente";
      case "PROCESSING":
        return "En cours";
      case "DELIVERED":
        return "Livrée";
      case "CANCELLED":
        return "Annulée";
      default:
        return s;
    }
  };

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-royal-blue">
            Commande {order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR")} à{" "}
            {new Date(order.createdAt).toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <Badge className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-royal-blue">
                Articles Commandés
              </h2>
              <span className="text-sm text-gray-600">
                {order.items.length} article{order.items.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => {
                let coverImage = "/assets/placeholder-book.jpg";
                try {
                  const images =
                    typeof item.book.images === "string"
                      ? JSON.parse(item.book.images)
                      : item.book.images;
                  if (Array.isArray(images) && images.length > 0 && images[0]) {
                    coverImage = images[0];
                  }
                } catch (error) {
                  console.error("Error parsing book images:", error);
                }

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-16 h-20 shrink-0">
                      <img
                        src={coverImage}
                        alt={item.book.title}
                        className="absolute inset-0 w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-royal-blue">
                        {item.book.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.book.author}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-royal-blue">
                        {item.price.toLocaleString("fr-FR")} FCFA
                      </p>
                      <p className="text-sm text-gray-600">
                        Total:{" "}
                        {(item.price * item.quantity).toLocaleString("fr-FR")}{" "}
                        FCFA
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-royal-blue">Total</span>
                <span className="text-royal-blue">
                  {order.totalAmount.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-heading text-xl font-bold text-royal-blue mb-4">
              Informations Client
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium font-mono">{order.customerPhone}</p>
                </div>
              </div>
              {order.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Adresse de livraison</p>
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-xl font-bold text-royal-blue mb-4">
              Gestion du Statut
            </h2>
            <div className="space-y-4">
              <Select
                value={status}
                onValueChange={updateStatus}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="PROCESSING">En cours</SelectItem>
                  <SelectItem value="DELIVERED">Livrée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                </SelectContent>
              </Select>

              {isLoading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-royal-blue" />
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Retour aux commandes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
