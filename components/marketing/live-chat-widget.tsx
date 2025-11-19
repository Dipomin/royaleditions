"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "visitor" | "admin";
  senderName: string;
  createdAt: Date;
}

// Générer un ID unique pour le visiteur (stocké dans localStorage)
const getVisitorId = () => {
  if (typeof window === "undefined") return null;
  let visitorId = localStorage.getItem("chat_visitor_id");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("chat_visitor_id", visitorId);
  }
  return visitorId;
};

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showBadge, setShowBadge] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendWelcomeMessage = () => {
    setMessages([
      {
        id: "welcome",
        text: "Bonjour ! 👋 Je suis Sarah de Royal Editions. Comment puis-je vous aider aujourd'hui ?",
        sender: "admin",
        senderName: "Sarah",
        createdAt: new Date(),
      },
    ]);
  };

  // Initialiser ou récupérer la conversation
  const initializeConversation = useCallback(async () => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });

      if (response.ok) {
        const conversation = await response.json();
        setConversationId(conversation.id);

        // Charger les messages existants
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conversation.messages.map((msg: any) => ({
              id: msg.id,
              text: msg.text,
              sender: msg.sender,
              senderName: msg.senderName,
              createdAt: new Date(msg.createdAt),
            }))
          );
        } else {
          // Message de bienvenue automatique si nouvelle conversation
          setTimeout(() => {
            sendWelcomeMessage();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error initializing conversation:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen, conversationId, initializeConversation]);

  // Polling pour récupérer les nouveaux messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const fetchedMessages = await response.json();
        setMessages(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fetchedMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            senderName: msg.senderName,
            createdAt: new Date(msg.createdAt),
          }))
        );

        // Marquer les messages admin comme lus
        await fetch(`/api/chat/conversations/${conversationId}/messages`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: "admin" }),
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isOpen && conversationId) {
      // Récupérer les messages immédiatement
      fetchMessages();

      // Puis toutes les 3 secondes
      pollingInterval.current = setInterval(fetchMessages, 3000);

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [isOpen, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isLoading) return;

    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "visitor",
            senderName: "Visiteur",
            text: messageText,
          }),
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: newMessage.id,
            text: newMessage.text,
            sender: newMessage.sender,
            senderName: newMessage.senderName,
            createdAt: new Date(newMessage.createdAt),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-100"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
                setShowBadge(false);
              }}
              size="lg"
              className="relative h-16 w-16 rounded-full bg-linear-to-br from-royal-blue to-royal-blue-light shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="h-7 w-7 text-white" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                  1
                </span>
              )}
            </Button>
            <div className="absolute -top-12 right-0 bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap animate-bounce">
              Besoin d&apos;aide ? 💬
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-2xl z-100 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-royal-blue to-royal-blue-light p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white font-bold">
                    SR
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Sarah</div>
                  <div className="text-xs text-gray-200">En ligne</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/10 p-1 rounded transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 p-1 rounded transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "visitor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === "visitor"
                            ? "bg-royal-blue text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "visitor"
                              ? "text-gray-200"
                              : "text-gray-500"
                          }`}
                        >
                          {message.createdAt.toLocaleTimeString("fr-FR", {
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
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      placeholder="Écrivez votre message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="bg-royal-blue hover:bg-royal-blue-light shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Temps de réponse moyen : 2 minutes
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
