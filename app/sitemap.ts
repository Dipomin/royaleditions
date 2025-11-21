import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaleditions.com'

  // Récupérer tous les livres
  const books = await prisma.book.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Récupérer tous les articles de blog publiés
  const blogPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Pages statiques
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/livre`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Pages de livres
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookPages = books.map((book: any) => ({
    url: `${baseUrl}/livre/${book.slug}`,
    lastModified: book.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Pages de blog
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogPages = blogPosts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...bookPages, ...blogPages]
}
