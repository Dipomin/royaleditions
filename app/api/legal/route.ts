import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    
    if (slug) {
      const page = await prisma.legalPage.findUnique({
        where: { slug, published: true },
      })
      
      if (!page) {
        return NextResponse.json(
          { error: 'Page non trouvée' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(page)
    }
    
    const pages = await prisma.legalPage.findMany({
      where: { published: true },
      orderBy: { slug: 'asc' },
    })
    
    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching legal pages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pages légales' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const page = await prisma.legalPage.create({
      data: body,
    })
    
    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating legal page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la page légale' },
      { status: 500 }
    )
  }
}
