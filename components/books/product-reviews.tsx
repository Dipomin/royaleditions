"use client";

import { Star } from "lucide-react";

interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

// Données d'exemple d'avis - à remplacer par des vraies données de la base de données
const SAMPLE_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Aminata K.",
    rating: 5,
    date: "2024-11-15",
    comment:
      "Excellent livre ! Très instructif et bien écrit. La livraison a été rapide et le livre était en parfait état. Je recommande vivement Royal Editions.",
    verified: true,
  },
  {
    id: "2",
    name: "Kouassi D.",
    rating: 5,
    date: "2024-11-10",
    comment:
      "Un vrai plaisir de lecture. Le contenu est riche et captivant. Le service client de Royal Editions est très professionnel. Merci !",
    verified: true,
  },
  {
    id: "3",
    name: "Fatoumata S.",
    rating: 4,
    date: "2024-11-05",
    comment:
      "Très bon livre, conforme à la description. Juste une petite remarque sur l'emballage qui pourrait être amélioré, mais le livre est arrivé en bon état.",
    verified: true,
  },
  {
    id: "4",
    name: "Ibrahim T.",
    rating: 5,
    date: "2024-10-28",
    comment:
      "Je suis impressionné par la qualité du livre et la rapidité de la livraison. Royal Editions est devenu ma référence pour l'achat de livres en Côte d'Ivoire.",
    verified: true,
  },
  {
    id: "5",
    name: "Adjoua M.",
    rating: 5,
    date: "2024-10-20",
    comment:
      "Superbe découverte ! Le livre est passionnant du début à la fin. Le paiement à la livraison est très pratique. Je recommande à 100%.",
    verified: true,
  },
];

export function ProductReviews() {
  // Calculer la moyenne des notes
  const averageRating =
    SAMPLE_REVIEWS.reduce((acc, review) => acc + review.rating, 0) /
    SAMPLE_REVIEWS.length;
  const totalReviews = SAMPLE_REVIEWS.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12">
      {/* En-tête */}
      <div className="mb-10">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold text-royal-blue mb-4">
          Avis des lecteurs
        </h2>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(averageRating)
                      ? "fill-gold text-gold"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-royal-blue">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-gray-600">
            Basé sur {totalReviews} avis vérifiés
          </span>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-6">
        {SAMPLE_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {review.avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold font-bold text-lg">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Contenu de l'avis */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-bold text-royal-blue">
                    {review.name}
                  </span>
                  {review.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      ✓ Achat vérifié
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Étoiles */}
                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-gold text-gold"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Commentaire */}
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <div className="mt-10 pt-10 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = SAMPLE_REVIEWS.filter(
              (r) => r.rating === stars
            ).length;
            const percentage = (count / totalReviews) * 100;

            return (
              <div key={stars} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-sm font-semibold text-royal-blue">
                    {stars}
                  </span>
                  <Star className="h-4 w-4 fill-gold text-gold" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-gold rounded-full h-2 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {count} avis ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
