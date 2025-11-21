"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface FloatingOrderButtonProps {
  onOrderClick: () => void;
}

export function FloatingOrderButton({
  onOrderClick,
}: FloatingOrderButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Afficher le bouton après avoir scrollé 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 lg:hidden">
      <Button
        onClick={onOrderClick}
        className="w-full bg-gold hover:bg-gold-dark text-royal-blue font-semibold py-6 text-lg shadow-2xl"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Valider la commande
      </Button>
    </div>
  );
}
