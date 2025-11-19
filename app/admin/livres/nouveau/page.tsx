import { prisma } from "@/lib/prisma";
import { BookForm } from "@/components/admin/book-form";

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function NewBookPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 lg:max-w-3xl mx-auto py-16">
      <div>
        <h1 className="font-heading text-3xl font-bold text-royal-blue">
          Ajouter un Livre
        </h1>
        <p className="text-gray-600">
          Remplissez les informations du nouveau livre
        </p>
      </div>

      <BookForm categories={categories} />
    </div>
  );
}
