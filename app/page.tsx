import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/books/book-card";
import { TrustBadges } from "@/components/marketing/trust-badges";
import { ArrowRight, Star, Truck, Shield, HeadphonesIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseBookImages } from "@/lib/utils/parse-images";

async function getFeaturedBooks() {
  try {
    return await prisma.book.findMany({
      where: {
        OR: [{ featured: true }, { bestseller: true }],
        stock: { gt: 0 },
      },
      include: {
        category: true,
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

async function getRecentBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

async function getTestimonials() {
  try {
    return await prisma.testimonial.findMany({
      where: { active: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

export default async function Home() {
  const [featuredBooksRaw, blogPosts, testimonials] = await Promise.all([
    getFeaturedBooks(),
    getRecentBlogPosts(),
    getTestimonials(),
  ]);

  // Convertir les Decimal en number
  const featuredBooks = featuredBooksRaw.map((book) => ({
    ...book,
    price: Number(book.price),
    originalPrice: book.originalPrice ? Number(book.originalPrice) : null,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section - Amélioré */}
      <section className="relative min-h-[700px] flex items-center justify-center bg-linear-to-br from-royal-blue via-royal-blue-light to-royal-blue overflow-hidden">
        {/* Background Pattern avec animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern.svg')] bg-repeat animate-subtle-float"></div>
        </div>

        {/* Éléments décoratifs flottants */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gold/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-delayed"></div>

        <div className="container-custom relative z-10 py-20 mx-4 lg:mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white animate-fade-in-up">
              <div className="inline-block">
                <span className="bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-gold/30">
                  ✨ Nouvelle collection disponible
                </span>
              </div>
              <h1 className="font-heading text-5xl lg:text-7xl font-bold leading-tight">
                Découvrez des livres
                <span className="block mt-2 bg-clip-text text-transparent bg-linear-to-r from-gold to-yellow-300">
                  d&apos;exception
                </span>
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed max-w-xl">
                Royal Editions vous propose une sélection premium de livres
                soigneusement choisis. Commandez maintenant et{" "}
                <span className="font-semibold text-gold">
                  payez à la livraison
                </span>
                .
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="btn-gold text-lg h-14 px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  asChild
                >
                  <Link href="/livre">
                    Explorer la boutique
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                  asChild
                >
                  <Link href="/a-propos">En savoir plus</Link>
                </Button>
              </div>
            </div>

            <div className="relative h-[500px] hidden lg:block">
              <Image
                src="/assets/1000_techniques_book_2_transparent.png"
                alt="Livre vedette"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features - Améliorées */}
      <section className="py-20 bg-linear-to-b from-gray-50 to-white lg:max-w-7xl mx-4 lg:mx-auto">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group flex items-start space-x-4 p-8 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gold/30 transform hover:-translate-y-1">
              <div className="bg-linear-to-br from-gold to-yellow-400 p-4 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold mb-2 text-royal-blue">
                  Livraison rapide
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Livraison dans toute la Côte d&apos;Ivoire sous 2-5 jours
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-8 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-royal-blue/30 transform hover:-translate-y-1">
              <div className="bg-linear-to-br from-royal-blue to-blue-600 p-4 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold mb-2 text-royal-blue">
                  Paiement sécurisé
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Payez en toute sécurité à la livraison (Cash ou Mobile Money)
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-8 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gold/30 transform hover:-translate-y-1">
              <div className="bg-linear-to-br from-gold to-yellow-400 p-4 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <HeadphonesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold mb-2 text-royal-blue">
                  Support client
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Une équipe à votre écoute 7j/7 pour vous accompagner
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - Statistiques de satisfaction */}
      <section className="py-16 lg:max-w-7xl mx-4 lg:mx-auto">
        <div className="container-custom">
          <TrustBadges />
        </div>
      </section>

      {/* Featured Books - Amélioré */}
      {featuredBooks.length > 0 && (
        <section className="py-24 bg-white lg:max-w-7xl mx-4 lg:mx-auto">
          <div className="container-custom">
            <div className="text-center mb-16 space-y-4 animate-fade-in-up">
              <div className="inline-block">
                <span className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Sélection Premium
                </span>
              </div>
              <h2 className="font-heading text-5xl lg:text-6xl font-bold text-royal-blue">
                Livres vedettes
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Découvrez notre sélection de livres les plus populaires et nos
                dernières nouveautés soigneusement choisies
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {featuredBooks.map((book: any, index: number) => (
                <div
                  key={book.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>

            <div className="text-center animate-fade-in-up">
              <Button
                size="lg"
                className="btn-royal-blue shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                asChild
              >
                <Link href="/livre">
                  Voir tous les livres
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - Améliorés */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-linear-to-b from-gray-50 to-white lg:max-w-7xl mx-auto">
          <div className="container-custom">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-block">
                <span className="bg-royal-blue/10 text-royal-blue px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Témoignages Clients
                </span>
              </div>
              <h2 className="font-heading text-5xl lg:text-6xl font-bold text-royal-blue">
                Ils nous font confiance
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Des milliers de lecteurs satisfaits partagent leur expérience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {testimonials.map((testimonial: any, index: number) => (
                <div
                  key={testimonial.id}
                  className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gold/30 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-gold text-gold drop-shadow-sm"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed text-base">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                    {testimonial.image && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gold/20">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-royal-blue">
                        {testimonial.name}
                      </p>
                      {testimonial.role && (
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Preview - Amélioré */}
      {blogPosts.length > 0 && (
        <section className="py-24 bg-white lg:max-w-7xl mx-auto">
          <div className="container-custom">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-block">
                <span className="bg-royal-blue/10 text-royal-blue px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Notre Blog
                </span>
              </div>
              <h2 className="font-heading text-5xl lg:text-6xl font-bold text-royal-blue">
                Derniers articles
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Actualités, conseils de lecture et découvertes littéraires
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {blogPosts.map((post: any, index: number) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-royal-blue/30 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {post.coverImage && (
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-royal-blue/10 text-royal-blue text-xs font-semibold px-3 py-1 rounded-full">
                        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-royal-blue transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-royal-blue font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                      Lire l&apos;article
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                asChild
              >
                <Link href="/blog">
                  Voir tous les articles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Améliorée */}
      <section className="relative py-24 bg-linear-to-br from-royal-blue via-royal-blue-light to-royal-blue overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="container-custom text-center relative z-10 mx-4 lg:mx-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-block">
              <span className="bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-gold/30">
                🎁 Offre spéciale
              </span>
            </div>
            <h2 className="font-heading text-4xl lg:text-6xl font-bold text-white leading-tight">
              Prêt à découvrir votre
              <span className="block mt-2 text-gold">prochaine lecture ?</span>
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
              Parcourez notre collection et trouvez le livre parfait pour vous.
              Livraison gratuite et paiement sécurisé à la réception.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="btn-gold text-lg h-14 px-10 shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5 transition-all duration-200"
                asChild
              >
                <Link href="/livre">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-10 bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 shadow-lg"
                asChild
              >
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
