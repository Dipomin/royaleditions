import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderAmount } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      )
    }

    // Trouver le code promo
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 404 }
      )
    }

    // Vérifier si le code est actif
    if (!promoCode.active) {
      return NextResponse.json(
        { error: 'Ce code promo n\'est plus actif' },
        { status: 400 }
      )
    }

    // Vérifier la date d'expiration
    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Ce code promo a expiré' },
        { status: 400 }
      )
    }

    // Vérifier le nombre d'utilisations
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json(
        { error: 'Ce code promo a atteint sa limite d\'utilisation' },
        { status: 400 }
      )
    }

    // Vérifier le montant minimum
    if (promoCode.minAmount && orderAmount < Number(promoCode.minAmount)) {
      return NextResponse.json(
        { 
          error: `Montant minimum requis: ${Number(promoCode.minAmount).toLocaleString('fr-FR')} FCFA`,
        },
        { status: 400 }
      )
    }

    // Calculer la réduction
    let discountAmount = 0
    if (promoCode.discountType === 'percentage') {
      discountAmount = (orderAmount * Number(promoCode.discountValue)) / 100
    } else if (promoCode.discountType === 'fixed') {
      discountAmount = Number(promoCode.discountValue)
    }

    // S'assurer que la réduction ne dépasse pas le montant total
    discountAmount = Math.min(discountAmount, orderAmount)

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: Number(promoCode.discountValue),
      discountAmount: Math.round(discountAmount),
      description: promoCode.description,
    })
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation du code promo' },
      { status: 500 }
    )
  }
}
