import { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Target, Users, Award, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez l'histoire et la mission de Royal Editions",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen ">
      {/* Hero */}
      <section className="bg-linear-to-br from-royal-blue to-royal-blue-light py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="font-heading text-5xl font-bold mb-6">
              À propos de Royal Editions
            </h1>
            <p className="text-xl leading-relaxed">
              Votre librairie premium dédiée à l&apos;excellence littéraire et
              au développement personnel
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:max-w-7xl mx-auto">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/assets/Logo-Royal-Editions.png"
                alt="Royal Editions"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-6">
              <div>
                <Target className="h-12 w-12 text-gold mb-4" />
                <h2 className="font-heading text-3xl font-bold text-royal-blue mb-4">
                  Notre Mission
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Rendre accessible à tous les Ivoiriens des livres de qualité
                  premium qui transforment les vies, enrichissent les
                  connaissances et inspirent l&apos;excellence. Nous croyons au
                  pouvoir transformateur de la lecture et nous engageons à
                  offrir une expérience d&apos;achat exceptionnelle.
                </p>
              </div>
              <div>
                <Award className="h-12 w-12 text-gold mb-4" />
                <h2 className="font-heading text-3xl font-bold text-royal-blue mb-4">
                  Notre Vision
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Devenir la référence en Côte d&apos;Ivoire pour les livres de
                  développement personnel, de business et de savoir-faire
                  technique. Nous aspirons à créer une communauté de lecteurs
                  passionnés et engagés dans leur développement continu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 lg:max-w-7xl mx-auto">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-royal-blue mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600">
              Les principes qui guident chacune de nos actions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-royal-blue mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 text-sm">
                Sélection rigoureuse de livres de qualité premium pour nos
                clients
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-royal-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-royal-blue" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-royal-blue mb-3">
                Service Client
              </h3>
              <p className="text-gray-600 text-sm">
                Accompagnement personnalisé et écoute attentive de vos besoins
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-royal-blue mb-3">
                Passion
              </h3>
              <p className="text-gray-600 text-sm">
                Amour des livres et engagement pour la promotion de la lecture
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="bg-royal-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-royal-blue" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-royal-blue mb-3">
                Innovation
              </h3>
              <p className="text-gray-600 text-sm">
                Solutions modernes pour une expérience d&apos;achat fluide et
                agréable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:max-w-7xl mx-auto">
        <div className="container-custom">
          <div className="bg-linear-to-br from-royal-blue to-royal-blue-light rounded-2xl p-12 text-center text-white">
            <h2 className="font-heading text-4xl font-bold mb-6">
              Rejoignez notre communauté
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Découvrez notre sélection de livres et commencez votre voyage vers
              l&apos;excellence
            </p>
            <Button size="lg" className="btn-gold text-lg h-14 px-8" asChild>
              <Link href="/boutique">
                Explorer la boutique
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
