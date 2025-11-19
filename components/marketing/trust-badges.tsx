"use client";

import { Shield, Users, Star, Award, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function TrustBadges() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    satisfactionRate: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    // Simuler le chargement des statistiques
    // Dans un cas réel, ces données viendraient d'une API
    setTimeout(() => {
      setStats({
        totalCustomers: 2547,
        satisfactionRate: 98,
        averageRating: 4.8,
        totalReviews: 1834,
      });
    }, 500);
  }, []);

  return (
    <div className="bg-linear-to-br from-royal-blue via-royal-blue-light to-royal-blue py-12 px-6 rounded-2xl shadow-xl">
      <div className="max-w-6xl mx-auto">
        {/* Titre */}
        <div className="text-center mb-8">
          <h3 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-2">
            Rejoignez nos lecteurs satisfaits
          </h3>
          <p className="text-gray-200 text-sm">
            Des milliers de clients nous font confiance
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total clients */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/20 rounded-full mb-3">
              <Users className="h-6 w-6 text-gold" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {stats.totalCustomers.toLocaleString("fr-FR")}+
            </div>
            <div className="text-xs lg:text-sm text-gray-200">
              Clients satisfaits
            </div>
          </div>

          {/* Taux de satisfaction */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-3">
              <CheckCircle className="h-6 w-6 text-green-300" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {stats.satisfactionRate}%
            </div>
            <div className="text-xs lg:text-sm text-gray-200">
              Taux de satisfaction
            </div>
          </div>

          {/* Note moyenne */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/20 rounded-full mb-3">
              <Star className="h-6 w-6 text-gold fill-gold" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {stats.averageRating}/5
            </div>
            <div className="text-xs lg:text-sm text-gray-200">Note moyenne</div>
          </div>

          {/* Nombre d'avis */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/20 rounded-full mb-3">
              <Award className="h-6 w-6 text-gold" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
              {stats.totalReviews.toLocaleString("fr-FR")}+
            </div>
            <div className="text-xs lg:text-sm text-gray-200">Avis clients</div>
          </div>
        </div>

        {/* Badges de certification */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:gap-6">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <Shield className="h-5 w-5 text-gold" />
            <span className="text-sm text-white font-medium">
              Paiement sécurisé
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <CheckCircle className="h-5 w-5 text-green-300" />
            <span className="text-sm text-white font-medium">
              Livraison garantie
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <Award className="h-5 w-5 text-gold" />
            <span className="text-sm text-white font-medium">
              Qualité premium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
