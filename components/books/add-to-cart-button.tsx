"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { trackEvent } from "@/components/marketing/analytics-scripts";
import { parseBookImages } from "@/lib/utils/parse-images";

interface AddToCartButtonProps {
  book: {
    id: string;
    title: string;
    slug: string;
    price: number;
    images: string;
    stock: number;
  };
}

export function AddToCartButton({ book }: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);
  const images = parseBookImages(book.images);

  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      image: images[0] || "/placeholder-book.png",
      slug: book.slug,
    });

    // Tracking analytics
    trackEvent.addToCart(book.id, book.title, book.price);

    toast.success(`"${book.title}" ajouté au panier`);
  };

  return (
    <Button
      size="lg"
      className="w-full btn-gold text-lg h-14"
      onClick={handleAddToCart}
      disabled={book.stock === 0}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {book.stock === 0 ? "Rupture de stock" : `Ajouter au panier ${book.price}F CFA`}
    </Button>
  );
}
