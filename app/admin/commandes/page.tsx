import { prisma } from "@/lib/prisma";
import { OrdersListClient } from "@/components/admin/orders-list-client";

async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convertir les Decimal en number pour la sérialisation
  return orders.map((order) => ({
    ...order,
    totalAmount: order.totalAmount.toNumber(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  }));
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return <OrdersListClient initialOrders={orders} />;
}
