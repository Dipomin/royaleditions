import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET - Récupérer un code promo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
    })

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Code promo introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Error fetching promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du code promo' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un code promo
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        code: body.code.toUpperCase(),
        description: body.description || null,
        discountType: body.discountType,
        discountValue: parseFloat(body.discountValue),
        minAmount: body.minAmount ? parseFloat(body.minAmount) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        active: body.active !== undefined ? body.active : true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Error updating promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du code promo' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un code promo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.promoCode.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du code promo' },
      { status: 500 }
    )
  }
}
