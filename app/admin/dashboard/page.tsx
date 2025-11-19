import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  ShoppingCart,
  Package,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

async function getStats() {
  const [
    totalBooks,
    totalOrders,
    pendingOrders,
    totalRevenue,
    openConversations,
    unreadMessages,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.chatConversation.count({ where: { status: "open" } }),
    prisma.chatMessage.count({
      where: { sender: "visitor", read: false },
    }),
  ]);

  return {
    totalBooks,
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0,
    openConversations,
    unreadMessages,
  };
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          book: true,
        },
      },
    },
  });
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  const cards = [
    {
      title: "Total Livres",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Commandes",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "En Attente",
      value: stats.pendingOrders,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Chiffre d'Affaires",
      value: `${stats.totalRevenue.toLocaleString("fr-FR")} FCFA`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Conversations Chat",
      value: stats.openConversations,
      icon: MessageCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
      href: "/admin/chat",
    },
  ];

  return (
    <div className="space-y-8 lg:max-w-7xl mx-auto py-16">
      <div>
        <h1 className="font-heading text-3xl font-bold text-royal-blue">
          Dashboard
        </h1>
        <p className="text-gray-600">Vue d&apos;ensemble de votre boutique</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const cardContent = (
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                {card.badge && (
                  <Badge className="bg-red-500 text-white">{card.badge}</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-royal-blue">{card.value}</p>
            </Card>
          );

          return card.href ? (
            <Link
              key={card.title}
              href={card.href}
              className="block hover:shadow-lg transition-shadow"
            >
              {cardContent}
            </Link>
          ) : (
            <div key={card.title}>{cardContent}</div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-heading text-xl font-bold text-royal-blue mb-4">
            Commandes Récentes
          </h2>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune commande pour le moment
              </p>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-royal-blue">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-royal-blue">
                      {order.totalAmount.toNumber().toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "PENDING"
                          ? "bg-orange-100 text-orange-700"
                          : order.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-xl font-bold text-royal-blue mb-4">
            Actions Rapides
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/livres/nouveau"
              className="block p-4 bg-linear-to-r from-gold to-gold/80 text-royal-blue rounded-lg hover:shadow-lg transition-all font-medium text-center"
            >
              + Ajouter un livre
            </a>
            <Link
              href="/admin/chat"
              className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              Gérer le Chat
              {stats.unreadMessages > 0 && (
                <Badge className="bg-red-500 ml-2">
                  {stats.unreadMessages}
                </Badge>
              )}
            </Link>
            <Link
              href="/admin/commandes"
              className="block p-4 bg-royal-blue text-white rounded-lg hover:bg-royal-blue/90 transition-all font-medium text-center"
            >
              Voir toutes les commandes
            </Link>
            <a
              href="/admin/blog/nouveau"
              className="block p-4 border-2 border-royal-blue text-royal-blue rounded-lg hover:bg-royal-blue hover:text-white transition-all font-medium text-center"
            >
              + Nouvel article de blog
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
