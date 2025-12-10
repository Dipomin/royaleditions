import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    // Convertir les Decimal en number pour la sérialisation JSON
    const serializedOrders = orders.map((order) => ({
      ...order,
      totalAmount: order.totalAmount.toNumber(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      })),
    }));

    return NextResponse.json(serializedOrders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}
