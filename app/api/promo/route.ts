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

    // Validation des données requises
    if (!body.code || !body.discountType || !body.discountValue) {
      return NextResponse.json(
        { error: 'Données manquantes : code, discountType et discountValue sont requis' },
        { status: 400 }
      )
    }

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

    // Convertir et valider discountValue
    const discountValue = typeof body.discountValue === 'string' 
      ? parseFloat(body.discountValue) 
      : body.discountValue
    
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { error: 'La valeur de réduction doit être un nombre positif' },
        { status: 400 }
      )
    }

    // Convertir et valider minAmount si présent
    let minAmount = null
    if (body.minAmount && body.minAmount !== '') {
      const parsedMinAmount = typeof body.minAmount === 'string'
        ? parseFloat(body.minAmount)
        : body.minAmount
      
      if (isNaN(parsedMinAmount) || parsedMinAmount < 0) {
        return NextResponse.json(
          { error: 'Le montant minimum doit être un nombre positif ou nul' },
          { status: 400 }
        )
      }
      minAmount = parsedMinAmount
    }

    // Convertir et valider maxUses si présent
    let maxUses = null
    if (body.maxUses && body.maxUses !== '') {
      const parsedMaxUses = typeof body.maxUses === 'string'
        ? parseInt(body.maxUses, 10)
        : body.maxUses
      
      if (isNaN(parsedMaxUses) || parsedMaxUses <= 0) {
        return NextResponse.json(
          { error: 'Le nombre maximum d\'utilisations doit être un nombre entier positif' },
          { status: 400 }
        )
      }
      maxUses = parsedMaxUses
    }

    // Valider et convertir expiresAt si présent
    let expiresAt = null
    if (body.expiresAt && body.expiresAt !== '') {
      const parsedDate = new Date(body.expiresAt)
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Date d\'expiration invalide' },
          { status: 400 }
        )
      }
      expiresAt = parsedDate
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: body.code.toUpperCase(),
        description: body.description && body.description !== '' ? body.description : null,
        discountType: body.discountType,
        discountValue: discountValue,
        minAmount: minAmount,
        maxUses: maxUses,
        active: body.active !== undefined ? body.active : true,
        expiresAt: expiresAt,
      },
    })

    return NextResponse.json(promoCode, { status: 201 })
  } catch (error) {
    console.error('Error creating promo code:', error)
    
    // Fournir plus de détails sur l'erreur en développement
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('Détails de l\'erreur:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du code promo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
