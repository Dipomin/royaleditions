import { NextResponse } from 'next/server'
import { verifyEmailConfig } from '@/lib/email'

export async function GET() {
  try {
    const isValid = await verifyEmailConfig()
    
    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Configuration SMTP vérifiée avec succès',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Erreur de configuration SMTP',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur lors de la vérification SMTP:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la vérification de la configuration SMTP',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
