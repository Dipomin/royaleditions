import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les conversations pour l'admin
export async function GET() {
  try {
    const conversations = await prisma.chatConversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Dernier message pour preview
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Compter les messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            conversationId: conv.id,
            sender: "visitor",
            read: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
}

// POST - Créer ou récupérer une conversation
export async function POST(request: Request) {
  try {
    const { visitorId, visitorName, visitorEmail } = await request.json();

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitorId requis" },
        { status: 400 }
      );
    }

    // Chercher une conversation existante
    let conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    // Si elle n'existe pas, la créer
    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          visitorId,
          visitorName: visitorName || "Visiteur",
          visitorEmail,
          status: "open",
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating/fetching conversation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la conversation" },
      { status: 500 }
    );
  }
}
