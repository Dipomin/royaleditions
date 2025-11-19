import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { parseBookImages } from "@/lib/utils/parse-images";

async function getBooks() {
  return prisma.book.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-royal-blue">
            Gestion des Livres
          </h1>
          <p className="text-gray-600">
            {books.length} livre{books.length > 1 ? "s" : ""} au catalogue
          </p>
        </div>
        <Link href="/admin/livres/nouveau">
          <Button className="btn-gold">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un livre
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">
                  Image
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Titre
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Catégorie
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Prix
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Stock
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Statut
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Aucun livre dans le catalogue
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                books.map((book: any) => {
                  let coverImage = "";
                  let hasValidImage = false;

                  try {
                    const images = parseBookImages(book.images);
                    if (images.length > 0 && images[0]) {
                      coverImage = images[0];
                      hasValidImage = true;
                    }
                  } catch (error) {
                    console.error("Error parsing book images:", error);
                  }
                  return (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="relative w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                          {hasValidImage ? (
                            <Image
                              src={coverImage}
                              alt={book.title}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-royal-blue">
                            {book.title}
                          </p>
                          <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-royal-blue/10 text-royal-blue rounded text-sm">
                          {book.category.name}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {book.price.toNumber().toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            book.stock > 10
                              ? "bg-green-100 text-green-700"
                              : book.stock > 0
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {book.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {book.featured && (
                            <span className="px-2 py-1 bg-gold/20 text-gold rounded text-xs w-fit">
                              Featured
                            </span>
                          )}
                          {book.bestseller && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs w-fit">
                              Bestseller
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/livres/${book.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
