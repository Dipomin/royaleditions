import { prisma } from "@/lib/prisma";
import { BookForm } from "@/components/admin/book-form";
import { notFound } from "next/navigation";

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

async function getBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!book) {
    return null;
  }

  return book;
}

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, book] = await Promise.all([getCategories(), getBook(id)]);

  if (!book) {
    notFound();
  }

  // Convertir les types Prisma en types JavaScript standards
  const bookData = {
    ...book,
    price: book.price.toNumber(),
    originalPrice: book.originalPrice?.toNumber() || null,
  };

  return (
    <div className="space-y-6 lg:max-w-3xl mx-auto py-16">
      <div>
        <h1 className="font-heading text-3xl font-bold text-royal-blue">
          Modifier le Livre
        </h1>
        <p className="text-gray-600">
          Modifiez les informations du livre &quot;{book.title}&quot;
        </p>
      </div>

      <BookForm categories={categories} book={bookData} />
    </div>
  );
}
