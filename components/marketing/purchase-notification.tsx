"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface Purchase {
  id: string;
  customerName: string;
  bookTitle: string;
  bookImage: string;
  location: string;
  timeAgo: string;
}

// Données simulées d'achats récents
const SAMPLE_PURCHASES: Purchase[] = [
  {
    id: "1",
    customerName: "Aminata K.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "Abidjan",
    timeAgo: "il y a 2 minutes",
  },
  {
    id: "2",
    customerName: "Kouassi D.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "Yamoussoukro",
    timeAgo: "il y a 5 minutes",
  },
  {
    id: "3",
    customerName: "Fatoumata S.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "Bouaké",
    timeAgo: "il y a 8 minutes",
  },
  {
    id: "4",
    customerName: "Ibrahim T.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "San-Pédro",
    timeAgo: "il y a 12 minutes",
  },
  {
    id: "5",
    customerName: "Artur C.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "Abidjan",
    timeAgo: "il y a 25 minutes",
  },
  {
    id: "6",
    customerName: "Armel G.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "Abidjan",
    timeAgo: "il y a 32 minutes",
  },
  {
    id: "7",
    customerName: "Yaya K.",
    bookTitle: "1000 techniques pour convaincre et influencer avec impact ",
    bookImage: "/assets/1000_techniques_book_2.png",
    location: "Abidjan",
    timeAgo: "il y a 55 minutes",
  },
];

export function PurchaseNotification() {
  const [currentNotification, setCurrentNotification] =
    useState<Purchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher une notification aléatoire toutes les 15-30 secondes
    const showNotification = () => {
      const randomPurchase =
        SAMPLE_PURCHASES[Math.floor(Math.random() * SAMPLE_PURCHASES.length)];
      setCurrentNotification(randomPurchase);
      setIsVisible(true);

      // Masquer après 6 secondes
      setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    };

    // Première notification après 20 secondes
    const initialTimeout = setTimeout(showNotification, 20000);

    // Notifications suivantes toutes les 20-35 secondes
    const interval = setInterval(() => {
      showNotification();
    }, Math.random() * 15000 + 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-100 max-w-sm"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              {/* Image du livre */}
              <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={currentNotification.bookImage}
                  alt={currentNotification.bookTitle}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-sm text-gray-900">
                      Achat récent
                    </span>
                  </div>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">
                    {currentNotification.customerName}
                  </span>{" "}
                  à{" "}
                  <span className="font-medium">
                    {currentNotification.location}
                  </span>
                </p>
                <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                  {currentNotification.bookTitle}
                </p>
                <p className="text-xs text-gray-500">
                  {currentNotification.timeAgo}
                </p>
              </div>
            </div>

            {/* Barre de progression */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
              className="h-1 bg-linear-to-r from-green-500 to-emerald-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
