import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...body,
        slug: body.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        images: JSON.stringify(body.images || []),
        price: parseFloat(body.price),
        originalPrice: body.originalPrice
          ? parseFloat(body.originalPrice)
          : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du livre" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du livre" },
      { status: 500 }
    );
  }
}
