import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

async function getBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6 lg:max-w-7xl mx-auto py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-royal-blue">
            Gestion du Blog
          </h1>
          <p className="text-gray-600">
            {posts.length} article{posts.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/admin/blog/nouveau">
          <Button className="btn-gold">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
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
                  Auteur
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Statut
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Aucun article de blog
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                posts.map((post: any) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="relative w-20 h-14">
                        <Image
                          src={
                            post.coverImage || "/assets/placeholder-blog.jpg"
                          }
                          alt={post.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-royal-blue line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {post.author}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          post.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {post.published ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Publié
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Brouillon
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/blog/${post.id}`}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
