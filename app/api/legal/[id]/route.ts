import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const page = await prisma.legalPage.findUnique({
      where: { id },
    })
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching legal page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la page' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const page = await prisma.legalPage.update({
      where: { id },
      data: body,
    })
    
    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating legal page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la page' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.legalPage.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting legal page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la page' },
      { status: 500 }
    )
  }
}
