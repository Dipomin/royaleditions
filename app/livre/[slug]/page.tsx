import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { parseBookImages } from "@/lib/utils/parse-images";
import { Badge } from "@/components/ui/badge";
import { DirectOrderForm } from "@/components/books/direct-order-form";
import { ProductViewTracker } from "@/components/marketing/product-view-tracker";
import { Truck, Shield, TrendingUp, Star, CheckCircle } from "lucide-react";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

async function getBook(slug: string) {
  return await prisma.book.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    return {
      title: "Livre non trouvé",
    };
  }

  const images = parseBookImages(book.images);

  return {
    title: `${book.title} - Commander maintenant`,
    description:
      book.summary ||
      `Commandez ${book.title} avec paiement sécurisé à la livraison. Livraison gratuite partout en Côte d'Ivoire.`,
    openGraph: {
      title: `${book.title} - Commander maintenant`,
      description:
        book.summary ||
        `Commandez ${book.title} avec paiement sécurisé à la livraison.`,
      images: images.length > 0 ? [images[0]] : [],
    },
  };
}

export default async function BookDirectOrderPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    notFound();
  }

  const images = parseBookImages(book.images);
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(book.originalPrice) - Number(book.price)) /
          Number(book.originalPrice)) *
          100
      )
    : 0;

  // Convertir book pour le formulaire
  const bookForForm = {
    id: book.id,
    title: book.title,
    price: Number(book.price),
    stock: book.stock,
  };

  return (
    <>
      {/* Track product view */}
      <ProductViewTracker
        bookId={book.id}
        title={book.title}
        price={Number(book.price)}
      />

      <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
        {/* Bannière Black Friday - Fixe en haut */}
        <div className="bg-linear-to-r from-black via-gray-900 to-black text-white py-3 sticky top-0 z-50 shadow-lg border-b-4 border-gold">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-lg md:text-xl bg-linear-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                  SPÉCIAL BLACK FRIDAY
                </span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                  -20%
                </span>
                <span>
                  Profitez de 20% de réduction jusqu&apos;au 30 novembre
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerte animée - Offre limitée */}
        <div className="bg-red-600 text-white py-2 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-8 font-bold text-sm md:text-base">
              ⚡ OFFRE LIMITÉE À 10 COMMANDES ⚡
            </span>
            <span className="mx-8 font-bold text-sm md:text-base">
              🎁 PLUS QUE QUELQUES EXEMPLAIRES 🎁
            </span>
            <span className="mx-8 font-bold text-sm md:text-base">
              ⏰ STOCK LIMITÉ - COMMANDEZ MAINTENANT ⏰
            </span>
            <span className="mx-8 font-bold text-sm md:text-base">
              ⚡ OFFRE LIMITÉE À 10 COMMANDES ⚡
            </span>
            <span className="mx-8 font-bold text-sm md:text-base">
              🎁 PLUS QUE QUELQUES EXEMPLAIRES 🎁
            </span>
            <span className="mx-8 font-bold text-sm md:text-base">
              ⏰ STOCK LIMITÉ - COMMANDEZ MAINTENANT ⏰
            </span>
          </div>
        </div>

        {/* En-tête mobile */}
        <div className="lg:hidden bg-white border-b sticky top-[88px] md:top-[84px] z-40 px-4 py-3">
          <Badge className="mb-2 text-xs">{book.category.name}</Badge>
          <h1 className="font-heading text-xl font-bold text-royal-blue">
            {book.title}
          </h1>
          {book.author && (
            <p className="text-sm italic text-gray-600">Par {book.author}</p>
          )}
        </div>

        <div className="container-custom py-6 lg:py-12 ">
          {/* Breadcrumb (desktop uniquement) */}
          <div className="hidden lg:block text-sm text-gray-600 mb-6 lg:mx-auto text-center">
            <Link href="/" className="hover:text-royal-blue">
              Accueil
            </Link>{" "}
            /{" "}
            <Link href="/livre" className="hover:text-royal-blue">
              Boutique
            </Link>{" "}
            /{" "}
            <Link
              href={`/livre?category=${book.category.slug}`}
              className="hover:text-royal-blue"
            >
              {book.category.name}
            </Link>{" "}
            / {book.title}
          </div>

          {/* Grid principal - 2 colonnes sur desktop */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-4 lg:mx-auto">
            {/* COLONNE GAUCHE - Image (fixe sur desktop) */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
                <Image
                  src={images[0] || "/placeholder-book.png"}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    -{discountPercent}%
                  </div>
                )}
                {book.bestseller && (
                  <div className="absolute top-4 left-4 bg-gold text-royal-blue px-3 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    BEST-SELLER
                  </div>
                )}
              </div>

              {/* Galerie miniatures (mobile) */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4 lg:hidden">
                  {images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-3/4 rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={image}
                        alt={`${book.title} - ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLONNE DROITE - Informations et Formulaire */}
            <div className="space-y-6 pb-24 lg:pb-0">
              {/* Titre desktop */}
              <div className="hidden lg:block">
                <Badge className="mb-3">{book.category.name}</Badge>
                <h1 className="font-heading text-4xl lg:text-5xl font-bold text-royal-blue mb-2">
                  {book.title}
                </h1>
                {book.author && (
                  <p className="text-lg italic text-gray-600">
                    Par {book.author}
                  </p>
                )}
              </div>

              {/* Badge urgence BLACK FRIDAY */}
              <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg mb-4 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-center">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-lg">BLACK FRIDAY -20%</p>
                    <p className="text-sm">
                      Plus que 10 commandes disponibles !
                    </p>
                  </div>
                  <span className="text-2xl">⚡</span>
                </div>
              </div>

              {/* Prix avec réduction Black Friday */}
              <div className="bg-white p-6 rounded-xl border-2 border-red-500 shadow-lg relative overflow-hidden">
                {/* Badge coin supérieur */}
                <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-2 text-xs font-bold transform rotate-45 translate-x-8 -translate-y-2">
                  BLACK FRIDAY
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-red-600">
                    {Math.round(Number(book.price) * 0.8).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    FCFA
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    {Number(book.price).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                    -20% BLACK FRIDAY
                  </span>
                  <span className="text-green-600 font-medium text-sm">
                    Économisez{" "}
                    {Math.round(Number(book.price) * 0.2).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    FCFA
                  </span>
                </div>
                {/* Compteur urgence */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      ⏰ Offre valable jusqu&apos;au:
                    </span>
                    <span className="text-red-600 font-bold">
                      30 novembre 2025
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-700 font-medium">
                      📦 Commandes restantes:
                    </span>
                    <span className="text-red-600 font-bold animate-pulse">
                      Seulement 10 !
                    </span>
                  </div>
                </div>
              </div>

              {/* Message d'urgence - Achat immédiat */}
              <div className="bg-linear-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 p-5 rounded-xl shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-orange-600 mb-2 text-lg">
                      Ne manquez pas cette occasion !
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>10 premiers clients</strong> bénéficient de la
                          réduction
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Stock limité</strong> - Expédition immédiate
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Offre exclusive</strong> Black Friday
                          jusqu&apos;au 30/11
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 animate-pulse">⚡</span>
                        <span className="font-bold text-red-600">
                          Commandez maintenant avant rupture de stock !
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Description courte */}
              {book.summary && (
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h2 className="font-heading text-lg font-semibold text-royal-blue mb-3">
                    À propos de ce livre
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {book.summary}
                  </p>
                </div>
              )}

              {/* Témoignages acheteurs récents */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-royal-blue mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-gold text-gold" />
                  Ce que disent nos clients
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p className="text-gray-600 italic">
                      &quot;Livré en 48h, très satisfait !&quot; -{" "}
                      <span className="font-medium">Koné A.</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p className="text-gray-600 italic">
                      &quot;Excellent rapport qualité-prix avec le Black
                      Friday&quot; -{" "}
                      <span className="font-medium">Diane M.</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p className="text-gray-600 italic">
                      &quot;Je recommande, commande facile et rapide&quot; -{" "}
                      <span className="font-medium">Yao J.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges de confiance */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {book.bestseller && (
                  <div className="bg-linear-to-br from-gold/10 to-gold/5 p-4 rounded-xl border border-gold/20">
                    <div className="flex items-center gap-2 text-gold mb-1">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold text-sm">Best-seller</span>
                    </div>
                    <p className="text-xs text-gray-600">Très demandé</p>
                  </div>
                )}

                {book.stock > 0 && (
                  <div className="bg-linear-to-br from-green-50 to-green-50/50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold text-sm">En stock</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {book.stock} exemplaire{book.stock > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                <div className="bg-linear-to-br from-blue-50 to-blue-50/50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Truck className="h-5 w-5" />
                    <span className="font-semibold text-sm">Livraison</span>
                  </div>
                  <p className="text-xs text-gray-600">Gratuite en CI</p>
                </div>
              </div>

              {/* Avantages */}
              <div className="bg-linear-to-br from-royal-blue/5 to-royal-blue/10 p-6 rounded-xl border border-royal-blue/20">
                <h3 className="font-heading text-lg font-semibold text-royal-blue mb-4">
                  Pourquoi commander chez nous ?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-royal-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-royal-blue">
                        Livraison gratuite
                      </p>
                      <p className="text-sm text-gray-600">
                        Partout en Côte d&apos;Ivoire
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-royal-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-royal-blue">
                        Paiement sécurisé
                      </p>
                      <p className="text-sm text-gray-600">
                        À la livraison uniquement
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire de commande */}
              <div id="order-form" className="scroll-mt-24">
                <DirectOrderForm book={bookForForm} />
              </div>

              {/* Description */}
              <div className="max-w-4xl mb-20 lg:max-w-7xl mx-auto">
                <h2 className="font-heading text-3xl font-bold text-royal-blue mb-6">
                  Description
                </h2>
                <div
                  className="rich-content"
                  dangerouslySetInnerHTML={{ __html: book.description }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
