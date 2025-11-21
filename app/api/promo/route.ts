import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les codes promo
export async function GET() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des codes promo' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau code promo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Vérifier si le code existe déjà
    const existing = await prisma.promoCode.findUnique({
      where: { code: body.code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code promo existe déjà' },
        { status: 400 }
      )
    }

    const promoCode = await prisma.promoCode.create({
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

    return NextResponse.json(promoCode, { status: 201 })
  } catch (error) {
    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du code promo' },
      { status: 500 }
    )
  }
}
