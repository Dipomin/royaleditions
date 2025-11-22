"use client";

import Script from "next/script";

interface AnalyticsScriptsProps {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
}

export function AnalyticsScripts({
  facebookPixelId,
  googleAnalyticsId,
}: AnalyticsScriptsProps) {
  // Utiliser les variables d'environnement si disponibles
  const fbPixelId =
    facebookPixelId ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
    "1742034899818715";
  const gaId =
    googleAnalyticsId ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    "G-H3QZZHDCPQ";

  return (
    <>
      {/* Facebook Pixel */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fbPixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Helper functions pour tracker les événements
export const trackEvent = {
  // Tracking d'ajout au panier
  addToCart: (bookId: string, bookTitle: string, price: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "AddToCart", {
        content_ids: [bookId],
        content_name: bookTitle,
        value: price,
        currency: "XOF",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag("event", "add_to_cart", {
        items: [
          {
            item_id: bookId,
            item_name: bookTitle,
            price: price,
          },
        ],
      });
    }
  },

  // Tracking d'achat
  purchase: (
    orderId: string,
    totalAmount: number,
    items: Array<{ id: string; name: string; price: number; quantity: number }>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "Purchase", {
        value: totalAmount,
        currency: "XOF",
        content_ids: items.map((item) => item.id),
        contents: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag("event", "purchase", {
        transaction_id: orderId,
        value: totalAmount,
        currency: "XOF",
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  },

  // Tracking de vue de produit
  viewProduct: (bookId: string, bookTitle: string, price: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "ViewContent", {
        content_ids: [bookId],
        content_name: bookTitle,
        content_type: "product",
        value: price,
        currency: "XOF",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag("event", "view_item", {
        items: [
          {
            item_id: bookId,
            item_name: bookTitle,
            price: price,
          },
        ],
      });
    }
  },

  // Tracking du début du checkout
  initiateCheckout: (totalAmount: number, itemCount: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "InitiateCheckout", {
        value: totalAmount,
        currency: "XOF",
        num_items: itemCount,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag("event", "begin_checkout", {
        value: totalAmount,
        currency: "XOF",
      });
    }
  },
};
