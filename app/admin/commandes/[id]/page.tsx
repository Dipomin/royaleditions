import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: order.items.map((item: any) => ({
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
