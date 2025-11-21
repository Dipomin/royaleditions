import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
  });
}

async function getRelatedPosts(currentPostId: string) {
  return prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: currentPostId },
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Article non trouvé",
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id);

  return (
    <div className="min-h-screen py-16 lg:max-w-7xl mx-auto">
      <article className="container-custom">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-8 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au blog
          </Button>
        </Link>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-royal-blue mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>

          {/* Share Button */}
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-96 md:h-[500px] mb-12 rounded-xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div
            className="rich-content prose prose-lg max-w-none
              prose-headings:font-heading prose-headings:text-royal-blue
              prose-a:text-gold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-royal-blue
              prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Card */}
          <Card className="mt-12 p-6 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-royal-blue flex items-center justify-center text-white text-2xl font-heading">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-royal-blue text-lg">
                  {post.author}
                </p>
                <p className="text-gray-600">Auteur</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-royal-blue mb-8">
                Articles Similaires
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {relatedPosts.map((relatedPost: any) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={
                            relatedPost.coverImage ||
                            "/assets/placeholder-blog.jpg"
                          }
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-bold text-royal-blue group-hover:text-gold transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
