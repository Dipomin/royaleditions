import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BookCard } from "@/components/books/book-card";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Découvrez notre collection de livres premium",
  openGraph: {
    title: `Boutique | ${SITE_CONFIG.name}`,
    description: "Découvrez notre collection de livres premium",
  },
};

async function getBooks() {
  try {
    return await prisma.book.findMany({
      where: { stock: { gt: 0 } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: { select: { books: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function ShopPage() {
  const [booksRaw, categories] = await Promise.all([
    getBooks(),
    getCategories(),
  ]);

  // Convertir les Decimal en number pour les Client Components
  const books = booksRaw.map((book) => ({
    ...book,
    price: Number(book.price),
    originalPrice: book.originalPrice ? Number(book.originalPrice) : null,
  }));

  return (
    <div className="container-custom py-20 lg:max-w-7xl mx-4 lg:mx-auto">
      <div className="mb-12">
        <h1 className="font-heading text-5xl font-bold text-royal-blue mb-4">
          Notre boutique
        </h1>
        <p className="text-xl text-gray-600">
          Explorez notre collection de {books.length} livres soigneusement
          sélectionnés
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="font-heading text-xl font-semibold text-royal-blue mb-4">
              Catégories
            </h2>
            <ul className="space-y-2">
              <li>
                <button className="text-sm hover:text-royal-blue transition-colors w-full text-left py-2">
                  Tous les livres ({books.length})
                </button>
              </li>
              {categories.map(
                (category: {
                  id: string;
                  name: string;
                  _count: { books: number };
                }) => (
                  <li key={category.id}>
                    <button className="text-sm hover:text-royal-blue transition-colors w-full text-left py-2">
                      {category.name} ({category._count.books})
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        </aside>

        {/* Books Grid */}
        <div className="lg:col-span-3">
          {books.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                Aucun livre disponible pour le moment
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {books.map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
