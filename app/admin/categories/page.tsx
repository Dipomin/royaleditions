import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "@/components/admin/categories-client";

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoriesClient initialCategories={categories} />;
}
