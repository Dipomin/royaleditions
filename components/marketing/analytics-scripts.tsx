"use client";

import Script from "next/script";

interface AnalyticsScriptsProps {
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  hotjarId?: string;
  hotjarVersion?: string;
}

export function AnalyticsScripts({
  facebookPixelId,
  googleAnalyticsId,
  hotjarId,
  hotjarVersion,
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
  const hjid = hotjarId || process.env.NEXT_PUBLIC_HOTJAR_ID || "5223971";
  const hjsv = hotjarVersion || process.env.NEXT_PUBLIC_HOTJAR_VERSION || "6";

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

      {/* Hotjar Tracking Code */}
      <script src="https://t.contentsquare.net/uxa/0230c048f6aa8.js"></script>
      <Script id="hotjar-tracking" strategy="afterInteractive">
        {`
          (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hjid},hjsv:${hjsv}};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
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
    // Hotjar - Trigger un événement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).hj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).hj("event", "checkout_initiated");
    }
  },
};

// Helper functions spécifiques pour Hotjar
export const hotjarTracking = {
  // Identifier un utilisateur (si connecté)
  identify: (userId: string, attributes?: Record<string, string | number>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).hj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).hj("identify", userId, attributes);
    }
  },

  // Déclencher un événement personnalisé
  triggerEvent: (eventName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).hj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).hj("event", eventName);
    }
  },

  // Ajouter des tags pour segmenter les utilisateurs
  tagRecording: (tags: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).hj) {
      tags.forEach((tag) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).hj("tagRecording", [tag]);
      });
    }
  },

  // Événements e-commerce spécifiques
  events: {
    addToCart: () => hotjarTracking.triggerEvent("add_to_cart"),
    purchase: () => hotjarTracking.triggerEvent("purchase_completed"),
    viewProduct: () => hotjarTracking.triggerEvent("product_viewed"),
    blackFridayPromo: () =>
      hotjarTracking.triggerEvent("black_friday_banner_seen"),
    formAbandonment: () =>
      hotjarTracking.triggerEvent("checkout_form_abandoned"),
  },
};
