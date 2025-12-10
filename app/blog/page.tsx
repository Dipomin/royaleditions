import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

async function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export const metadata = {
  title: "Blog - Royal Editions",
  description:
    "Découvrez nos articles sur le développement personnel, le business et la réussite",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen py-16 lg:max-w-7xl mx-auto">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-royal-blue mb-4">
            Notre Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos articles, conseils et analyses sur le développement
            personnel, le business et la réussite
          </p>
        </div>

        {/* Articles Grid */}
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              Aucun article publié pour le moment.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.coverImage || "/assets/placeholder-blog.jpg"}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-royal-blue mb-3 group-hover:text-gold transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center text-gold font-medium group-hover:gap-2 transition-all">
                      <span>Lire la suite</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <Card className="mt-16 p-8 md:p-12 bg-linear-to-r from-royal-blue to-royal-blue/90 text-white text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Restez Informé
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Recevez nos derniers articles et actualités directement dans votre
            boîte mail
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold text-royal-blue px-8 py-3 rounded-lg font-medium hover:bg-gold/90 transition-colors"
          >
            Nous Contacter
          </Link>
        </Card>
      </div>
    </div>
  );
}
