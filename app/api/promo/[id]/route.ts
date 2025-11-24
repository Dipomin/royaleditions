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

    // Validation des données requises
    if (!body.code || !body.discountType || !body.discountValue) {
      return NextResponse.json(
        { error: 'Données manquantes : code, discountType et discountValue sont requis' },
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

    const promoCode = await prisma.promoCode.update({
      where: { id },
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

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Error updating promo code:', error)
    
    // Fournir plus de détails sur l'erreur en développement
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error('Détails de l\'erreur:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du code promo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
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
