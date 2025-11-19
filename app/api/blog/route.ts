import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, excerpt, content, author, coverImage, published, metaTitle, metaDescription } = body

    if (!title || !excerpt || !content || !author) {
      return NextResponse.json(
        { error: 'Les champs titre, extrait, contenu et auteur sont requis' },
        { status: 400 }
      )
    }

    // Générer le slug
    const slug = slugify(title)
    
    // Vérifier l'unicité du slug
    let counter = 1
    let uniqueSlug = slug
    while (await prisma.blogPost.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: uniqueSlug,
        excerpt,
        content,
        author,
        coverImage: coverImage || null,
        published: published || false,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}
