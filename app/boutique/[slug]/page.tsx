import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookCard } from "@/components/books/book-card";
import { AddToCartButton } from "@/components/books/add-to-cart-button";
import { StickyProductBar } from "@/components/books/sticky-product-bar";
import { ProductReviews } from "@/components/books/product-reviews";
import { PopularityIndicator } from "@/components/marketing/popularity-indicator";
import { ProductViewTracker } from "@/components/marketing/product-view-tracker";
import { parseBookImages } from "@/lib/utils/parse-images";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, Shield } from "lucide-react";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

async function getBook(slug: string) {
  return await prisma.book.findUnique({
    where: { slug },
    include: { category: true },
  });
}

async function getRelatedBooks(categoryId: string, currentBookId: string) {
  return await prisma.book.findMany({
    where: {
      categoryId,
      id: { not: currentBookId },
      stock: { gt: 0 },
    },
    include: { category: true },
    take: 4,
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
    title: book.title,
    description: book.summary || book.description.substring(0, 160),
    openGraph: {
      title: book.title,
      description: book.summary || book.description.substring(0, 160),
      images: images.length > 0 ? [images[0]] : [],
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    notFound();
  }

  const images = parseBookImages(book.images);
  const relatedBooks = await getRelatedBooks(book.categoryId, book.id);
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;

  // Schema.org structured data
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://royaleditions.com";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    description: book.summary || book.description,
    image: images.map((img) => `${baseUrl}${img}`),
    brand: {
      "@type": "Brand",
      name: "Royal Editions",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/livre/${book.slug}`,
      priceCurrency: "XOF",
      price: book.price.toNumber(),
      availability:
        book.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Royal Editions",
      },
    },
    author: book.author
      ? {
          "@type": "Person",
          name: book.author,
        }
      : undefined,
    aggregateRating: book.featured
      ? {
          "@type": "AggregateRating",
          ratingValue: "5",
          reviewCount: "1",
        }
      : undefined,
  };

  // Convertir book pour AddToCartButton (Decimal → number)
  const bookForCart = {
    ...book,
    price: Number(book.price),
    originalPrice: book.originalPrice ? Number(book.originalPrice) : null,
  };

  // Convertir les livres liés
  const relatedBooksConverted = relatedBooks.map((relBook) => ({
    ...relBook,
    price: Number(relBook.price),
    originalPrice: relBook.originalPrice ? Number(relBook.originalPrice) : null,
  }));

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Track product view */}
      <ProductViewTracker
        bookId={book.id}
        title={book.title}
        price={Number(book.price)}
      />

      {/* Barre de produit flottante */}
      <StickyProductBar book={bookForCart} />

      <div className="container-custom pb-10 mx-4">
        {/* Book title */}
        <div className="text-md text-gray-600 mb-8 lg:max-w-7xl mx-auto">
          <Badge className="mb-3">{book.category.name}</Badge>
          <h1 className="font-heading lg:text-6xl text-4xl font-bold text-royal-blue mb-2">
            {book.title}
          </h1>
          {book.author && (
            <p className="text-md italic text-gray-600">Par {book.author}</p>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8 lg:max-w-7xl mx-auto">
          Accueil / Boutique / {book.category.name} / {book.title}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20 lg:max-w-7xl mx-auto">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={images[0] || "/placeholder-book.png"}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-3/4 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={image}
                      alt={`${book.title} - ${index + 2}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-royal-blue">
                {Number(book.price).toLocaleString("fr-FR")} FCFA
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {Number(book.originalPrice!).toLocaleString("fr-FR")} FCFA
                </span>
              )}
            </div>

            {book.summary && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {book.summary}
              </p>
            )}

            <div className="flex items-center space-x-4">
              {book.bestseller && (
                <Badge className="bg-gold text-royal-blue">Best-seller</Badge>
              )}
              {book.featured && (
                <Badge className="bg-royal-blue text-white">Nouveauté</Badge>
              )}
            </div>

            {/* Indicateurs de popularité */}
            <PopularityIndicator
              bookId={book.id}
              isBestseller={book.bestseller}
              stock={book.stock}
            />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <Package className="h-5 w-5 text-gold" />
                <span>
                  {book.stock > 0 ? (
                    <>
                      <span className="font-semibold text-green-600">
                        En stock
                      </span>
                      {book.stock <= 5 && (
                        <span className="text-orange-600 ml-2">
                          (Plus que {book.stock} exemplaires)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-semibold text-red-600">
                      Rupture de stock
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Truck className="h-5 w-5 text-gold" />
                <span>Livraison partout en Côte d&apos;Ivoire</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Shield className="h-5 w-5 text-gold" />
                <span>Paiement sécurisé à la livraison</span>
              </div>
            </div>

            <AddToCartButton book={bookForCart} />
          </div>
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

        {/* Avis des utilisateurs */}
        <div className="max-w-4xl mb-20 lg:max-w-7xl mx-auto">
          <ProductReviews />
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="lg:max-w-7xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-royal-blue mb-8">
              Vous pourriez aussi aimer
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {relatedBooksConverted.map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
