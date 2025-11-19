import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'recent'
    
    const where: Record<string, unknown> = {
      stock: { gt: 0 },
    }
    
    if (category) {
      where.category = {
        slug: category,
      }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    let orderBy: Record<string, unknown> = { createdAt: 'desc' }
    
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    if (sort === 'price-desc') orderBy = { price: 'desc' }
    if (sort === 'bestseller') orderBy = { bestseller: 'desc' }
    
    const books = await prisma.book.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
    })
    
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const book = await prisma.book.create({
      data: {
        ...body,
        slug: body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        images: JSON.stringify(body.images || []),
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      },
      include: {
        category: true,
      },
    })
    
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du livre' },
      { status: 500 }
    )
  }
}
