import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getOrders() {
  return prisma.order.findMany({
    include: {
      items: {
        include: {
          book: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();

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

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto py-16">
      <div>
        <h1 className="font-heading text-3xl font-bold text-royal-blue">
          Gestion des Commandes
        </h1>
        <p className="text-gray-600">
          {orders.length} commande{orders.length > 1 ? "s" : ""} au total
        </p>
      </div>

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                orders.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-mono text-sm font-medium text-royal-blue">
                        {order.orderNumber}
                      </span>
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
                        {order.totalAmount.toNumber().toLocaleString("fr-FR")}{" "}
                        FCFA
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
