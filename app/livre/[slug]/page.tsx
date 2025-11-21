import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { parseBookImages } from "@/lib/utils/parse-images";
import { Badge } from "@/components/ui/badge";
import { DirectOrderForm } from "@/components/books/direct-order-form";
import { ProductViewTracker } from "@/components/marketing/product-view-tracker";
import {
  Package,
  Truck,
  Shield,
  TrendingUp,
  Star,
  CheckCircle,
} from "lucide-react";

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
        {/* En-tête mobile */}
        <div className="lg:hidden bg-white border-b sticky top-0 z-40 px-4 py-3">
          <Badge className="mb-2 text-xs">{book.category.name}</Badge>
          <h1 className="font-heading text-xl font-bold text-royal-blue">
            {book.title}
          </h1>
          {book.author && (
            <p className="text-sm italic text-gray-600">Par {book.author}</p>
          )}
        </div>

        <div className="container-custom py-6 lg:py-12">
          {/* Breadcrumb (desktop uniquement) */}
          <div className="hidden lg:block text-sm text-gray-600 mb-6">
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

              {/* Prix */}
              <div className="bg-white p-6 rounded-xl border-2 border-gold/20 shadow-sm">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-royal-blue">
                    {Number(book.price).toLocaleString("fr-FR")} FCFA
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through">
                      {Number(book.originalPrice).toLocaleString("fr-FR")} FCFA
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-green-600 font-medium">
                    Économisez{" "}
                    {(
                      Number(book.originalPrice) - Number(book.price)
                    ).toLocaleString("fr-FR")}{" "}
                    FCFA ({discountPercent}%)
                  </p>
                )}
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
