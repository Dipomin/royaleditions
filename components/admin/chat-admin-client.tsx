"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, CheckCircle, Clock, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  lastMessageAt: string;
  messages: Message[];
  unreadCount: number;
}

export function ChatAdminClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  
  // Charger les conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Charger les messages d'une conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(
        `/api/chat/conversations/${selectedConversation.id}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        // Marquer les messages visiteur comme lus
        await fetch(
          `/api/chat/conversations/${selectedConversation.id}/messages`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: "visitor" }),
          }
        );

        // Rafraîchir la liste des conversations
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [selectedConversation, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      // Polling toutes les 2 secondes pour cette conversation
      pollingInterval.current = setInterval(fetchMessages, 2000);
      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [selectedConversation, fetchMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConversation || isLoading) return;

    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/chat/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "admin",
            senderName: "Sarah",
            text: messageText,
          }),
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        fetchConversations(); // Mettre à jour la liste
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseConversation = async (convId: string) => {
    try {
      await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      fetchConversations();
      if (selectedConversation?.id === convId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error closing conversation:", error);
    }
  };

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Liste des conversations */}
      <Card className="w-1/3 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-royal-blue text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </h2>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white">
                {totalUnread} nouveau{totalUnread > 1 ? "x" : ""}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune conversation pour le moment</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? "bg-gray-100" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-royal-blue flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {conv.visitorName || "Visiteur"}
                      </div>
                      {conv.visitorEmail && (
                        <div className="text-xs text-gray-500">
                          {conv.visitorEmail}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={conv.status === "open" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {conv.status === "open" ? "Ouvert" : "Fermé"}
                    </Badge>
                    {conv.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                {conv.messages[0] && (
                  <p className="text-sm text-gray-600 truncate">
                    {conv.messages[0].text}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Clock className="h-3 w-3" />
                  {new Date(conv.lastMessageAt).toLocaleString("fr-FR")}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Zone de conversation */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-royal-blue flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">
                    {selectedConversation.visitorName || "Visiteur"}
                  </div>
                  {selectedConversation.visitorEmail && (
                    <div className="text-xs text-gray-500">
                      {selectedConversation.visitorEmail}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.status === "open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCloseConversation(selectedConversation.id)
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Clôturer
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  className={`flex ${
                    message.sender === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.sender === "admin"
                        ? "bg-royal-blue text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {message.senderName}
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "admin"
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedConversation.status === "open" && (
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder="Écrivez votre réponse..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="bg-royal-blue hover:bg-royal-blue-light"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Sélectionnez une conversation</p>
              <p className="text-sm">pour commencer à discuter</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
