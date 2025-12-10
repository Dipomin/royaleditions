"use client";

import { useState, useEffect } from "react";
import { AddToCartButton } from "@/components/books/add-to-cart-button";
import { parseBookImages } from "@/lib/utils/parse-images";

interface StickyProductBarProps {
  book: {
    id: string;
    title: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    images: string;
    stock: number;
  };
}

export function StickyProductBar({ book }: StickyProductBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const images = parseBookImages(book.images);

  useEffect(() => {
    const handleScroll = () => {
      // Afficher la barre après 400px de scroll
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container-custom lg:max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Image et Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={images[0] || "/placeholder-book.png"}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-royal-blue text-sm lg:text-base line-clamp-1">
                {book.title}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg lg:text-xl font-bold text-royal-blue">
                  {book.price.toLocaleString("fr-FR")} FCFA
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {book.originalPrice.toLocaleString("fr-FR")} FCFA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bouton d'ajout au panier */}
          <div className="shrink-0">
            <AddToCartButton book={book} />
          </div>
        </div>
      </div>
    </div>
  );
}
