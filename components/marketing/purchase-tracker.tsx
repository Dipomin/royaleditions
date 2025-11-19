"use client";

import { useEffect } from "react";
import { trackEvent } from "./analytics-scripts";

interface PurchaseTrackerProps {
  orderId: string;
  totalAmount: number;
  items: Array<{
    book: {
      id: string;
      title: string;
    };
    quantity: number;
    price: number;
  }>;
}

export function PurchaseTracker({
  orderId,
  totalAmount,
  items,
}: PurchaseTrackerProps) {
  useEffect(() => {
    // Track purchase when component mounts
    const trackingItems = items.map((item) => ({
      id: item.book.id,
      name: item.book.title,
      quantity: item.quantity,
      price: item.price,
    }));

    trackEvent.purchase(orderId, totalAmount, trackingItems);
  }, [orderId, totalAmount, items]);

  return null; // This component doesn't render anything
}
