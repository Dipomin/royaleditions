import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les messages d'une conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
}

// POST - Envoyer un message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { sender, senderName, text } = await request.json();

    if (!text || !sender) {
      return NextResponse.json(
        { error: "Message et expéditeur requis" },
        { status: 400 }
      );
    }

    // Créer le message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        sender,
        senderName: senderName || (sender === "visitor" ? "Visiteur" : "Admin"),
        text,
        read: sender === "admin", // Les messages admin sont automatiquement "lus"
      },
    });

    // Mettre à jour le timestamp de la conversation
    await prisma.chatConversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

// PATCH - Marquer les messages comme lus
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { sender } = await request.json();

    // Marquer tous les messages de l'expéditeur comme lus
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: id,
        sender,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
