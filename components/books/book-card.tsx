"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store/cart";
import { toast } from "sonner";
import { parseBookImages } from "@/lib/utils/parse-images";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    slug: string;
    author?: string | null;
    price: number;
    originalPrice?: number | null;
    images: string;
    featured?: boolean;
    bestseller?: boolean;
    stock: number;
    category?: {
      name: string;
    };
  };
}

export function BookCard({ book }: BookCardProps) {
  const addItem = useCart((state) => state.addItem);

  // Debug logging
  console.log("BOOK IMAGES RAW:", book.images);
  console.log("BOOK IMAGES TYPE:", typeof book.images);

  const images = parseBookImages(book.images);
  console.log("PARSED IMAGES:", images);
  console.log(
    "PARSED IMAGES TYPE:",
    typeof images,
    "IS ARRAY:",
    Array.isArray(images)
  );

  const mainImage = images?.[0] || "";
  console.log("MAIN IMAGE:", mainImage);
  console.log("MAIN IMAGE TYPE:", typeof mainImage);

  const hasDiscount = book.originalPrice && book.originalPrice > book.price;

  console.log("MAIN IMAGE", mainImage);

  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      image: mainImage,
      slug: book.slug,
    });
    toast.success(`"${book.title}" ajouté au panier`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {book.bestseller && (
          <Badge className="bg-gold text-royal-blue font-semibold">
            Best-seller
          </Badge>
        )}
        {book.featured && (
          <Badge className="bg-royal-blue text-white font-semibold">
            Nouveauté
          </Badge>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
        <Link href={`/livre/${book.slug}`} className="absolute inset-0">
          <img
            src={mainImage}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <Button
            variant="secondary"
            size="sm"
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto"
            asChild
          >
            <Link href={`/livre/${book.slug}`}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        {book.category && (
          <p className="text-xs font-medium text-royal-blue uppercase tracking-wide">
            {book.category.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/livre/${book.slug}`}>
          <h3 className="font-heading text-xl font-semibold text-gray-900 line-clamp-2 hover:text-royal-blue transition-colors">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        {book.author && (
          <p className="text-sm text-gray-600">Par {book.author}</p>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-royal-blue">
              {book.price.toLocaleString("fr-FR")} FCFA
            </span>
          </div>

          <Button
            size="icon"
            className="btn-gold h-10 w-10"
            onClick={handleAddToCart}
            disabled={book.stock === 0}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Stock warning */}
        {book.stock === 0 && (
          <p className="text-xs text-red-600 font-medium">Rupture de stock</p>
        )}
        {book.stock > 0 && book.stock <= 5 && (
          <p className="text-xs text-orange-600 font-medium">
            Plus que {book.stock} en stock
          </p>
        )}
      </div>
    </motion.div>
  );
}
