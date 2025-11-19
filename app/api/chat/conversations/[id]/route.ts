import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH - Mettre à jour le statut d'une conversation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !["open", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide (open ou closed)" },
        { status: 400 }
      );
    }

    const conversation = await prisma.chatConversation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
