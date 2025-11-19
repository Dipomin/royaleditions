"use client";

import { Eye, TrendingUp, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface PopularityIndicatorProps {
  bookId: string;
  isBestseller?: boolean;
  stock: number;
}

export function PopularityIndicator({
  bookId,
  isBestseller,
  stock,
}: PopularityIndicatorProps) {
  // Initialiser avec des valeurs aléatoires dès le départ
  const [viewerCount, setViewerCount] = useState(
    () => Math.floor(Math.random() * 7) + 10
  );
  const [weekSales] = useState(() => {
    const baseSales = isBestseller ? 15 : 5;
    const maxSales = isBestseller ? 45 : 20;
    return Math.floor(Math.random() * (maxSales - baseSales + 1)) + baseSales;
  });

  useEffect(() => {
    // Mettre à jour les viewers toutes les 10-30 secondes
    const interval = setInterval(() => {
      const newViewers = Math.floor(Math.random() * 7) + 2;
      setViewerCount(newViewers);
    }, Math.random() * 20000 + 10000);

    return () => clearInterval(interval);
  }, [bookId, isBestseller]);

  return (
    <div className="space-y-2">
      {/* Badge Best-seller avec flamme */}
      {isBestseller && (
        <Badge className="bg-linear-to-r from-orange-500 to-red-500 text-white border-0 shadow-md animate-pulse">
          <Flame className="h-3.5 w-3.5 mr-1 fill-white" />
          Très demandé
        </Badge>
      )}

      {/* Indicateurs de popularité */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* Personnes qui consultent */}
        <div className="flex items-center gap-1.5 text-royal-blue bg-blue-50 px-3 py-1.5 rounded-full">
          <Eye className="h-4 w-4" />
          <span className="font-medium">{viewerCount}</span>
          <span className="text-xs text-gray-600">
            {viewerCount > 1 ? "personnes consultent" : "personne consulte"}
          </span>
        </div>

        

        {/* Stock faible */}
        {stock > 0 && stock <= 5 && (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-600"
          >
            ⚡ Plus que {stock} en stock
          </Badge>
        )}
      </div>
    </div>
  );
}
