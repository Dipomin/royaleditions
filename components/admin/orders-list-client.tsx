"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersListClientProps {
  initialOrders: Order[];
}

export function OrdersListClient({ initialOrders }: OrdersListClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [previousOrderCount, setPreviousOrderCount] = useState(
    initialOrders.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "PROCESSING":
        return "En cours";
      case "DELIVERED":
        return "Livrée";
      case "CANCELLED":
        return "Annulée";
      default:
        return status;
    }
  };

  const fetchOrders = useCallback(
    async (showToast = false) => {
      setIsRefreshing(true);
      try {
        const response = await fetch("/api/admin/orders");
        if (!response.ok) throw new Error("Erreur lors du chargement");

        const data = await response.json();
        setOrders(data);
        setLastUpdate(new Date());

        // Notification si nouvelles commandes
        if (data.length > previousOrderCount) {
          const newOrdersCount = data.length - previousOrderCount;
          toast.success(
            `🎉 ${newOrdersCount} nouvelle${
              newOrdersCount > 1 ? "s" : ""
            } commande${newOrdersCount > 1 ? "s" : ""} !`,
            {
              duration: 5000,
            }
          );
          // Jouer un son de notification (si disponible)
          if (typeof window !== "undefined" && "Audio" in window) {
            try {
              const audio = new Audio("/notification.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {
              // Ignorer si le fichier audio n'existe pas
            }
          }
        }
        setPreviousOrderCount(data.length);

        if (showToast) {
          toast.success("Liste des commandes actualisée");
        }
      } catch (error) {
        console.error("Erreur:", error);
        if (showToast) {
          toast.error("Erreur lors de l'actualisation");
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [previousOrderCount]
  );

  // Actualisation automatique toutes les 30 secondes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  const handleManualRefresh = () => {
    fetchOrders(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast.info(
      autoRefresh
        ? "Actualisation automatique désactivée"
        : "Actualisation automatique activée (30s)"
    );
  };

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto py-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-royal-blue">
            Gestion des Commandes
          </h1>
          <p className="text-gray-600">
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicateur de dernière mise à jour */}
          <span className="text-sm text-gray-500 hidden sm:inline">
            Mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
          </span>

          {/* Bouton auto-refresh */}
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {autoRefresh ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Auto
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Auto
              </>
            )}
          </Button>

          {/* Bouton de rafraîchissement manuel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Barre de notification pour les nouvelles commandes */}
      {autoRefresh && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            Actualisation automatique active - Nouvelles commandes détectées
            automatiquement
          </span>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">
                  N° Commande
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Client
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Téléphone
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Articles
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Total
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Statut
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Aucune commande pour le moment
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      index === 0 && order.status === "PENDING"
                        ? "bg-yellow-50 hover:bg-yellow-100"
                        : ""
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm font-medium text-royal-blue">
                        {order.orderNumber}
                      </span>
                      {index === 0 && order.status === "PENDING" && (
                        <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                          Nouveau
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-sm text-gray-600">
                            {order.customerEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm">
                        {order.customerPhone}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {order.items.length} article
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-royal-blue">
                        {order.totalAmount.toLocaleString("fr-FR")} FCFA
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/commandes/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
