"use client";

import { useEffect } from "react";
import { trackEvent } from "./analytics-scripts";

interface ProductViewTrackerProps {
  bookId: string;
  title: string;
  price: number;
}

export function ProductViewTracker({
  bookId,
  title,
  price,
}: ProductViewTrackerProps) {
  useEffect(() => {
    // Track product view when component mounts
    trackEvent.viewProduct(bookId, title, price);
  }, [bookId, title, price]);

  return null; // This component doesn't render anything
}
