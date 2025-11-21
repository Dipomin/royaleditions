import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function PrivacyPolicyPage() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "confidentialite", published: true },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="container-custom py-20 lg:max-w-5xl mx-4 lg:mx-auto">
      <h1 className="font-heading text-4xl font-bold text-royal-blue mb-8">
        {page.title}
      </h1>

      <Card className="p-8">
        <div
          className="prose prose-lg max-w-none prose-headings:text-royal-blue prose-a:text-gold hover:prose-a:text-gold-dark"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </Card>

      <div className="mt-8 text-sm text-gray-600">
        <p>
          Dernière mise à jour :{" "}
          {new Date(page.updatedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
