import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Création des codes promotionnels...')

  // Code promo 1: Réduction en pourcentage
  await prisma.promoCode.upsert({
    where: { code: 'ROYAL10' },
    update: {},
    create: {
      code: 'ROYAL10',
      description: 'Réduction de 10% sur toute la boutique',
      discountType: 'percentage',
      discountValue: 10,
      minAmount: 5000,
      maxUses: 100,
      active: true,
      expiresAt: new Date('2025-12-31'),
    },
  })

  // Code promo 2: Montant fixe
  await prisma.promoCode.upsert({
    where: { code: 'BIENVENUE' },
    update: {},
    create: {
      code: 'BIENVENUE',
      description: 'Offre de bienvenue - 2000 FCFA de réduction',
      discountType: 'fixed',
      discountValue: 2000,
      minAmount: 10000,
      maxUses: 50,
      active: true,
      expiresAt: null, // Pas d'expiration
    },
  })

  // Code promo 3: Grosse réduction limitée
  await prisma.promoCode.upsert({
    where: { code: 'NOEL2024' },
    update: {},
    create: {
      code: 'NOEL2024',
      description: 'Promotion de Noël - 25% de réduction',
      discountType: 'percentage',
      discountValue: 25,
      minAmount: 15000,
      maxUses: 20,
      active: true,
      expiresAt: new Date('2024-12-31'),
    },
  })

  // Code promo 4: VIP illimité
  await prisma.promoCode.upsert({
    where: { code: 'VIP20' },
    update: {},
    create: {
      code: 'VIP20',
      description: 'Code VIP réservé aux membres premium',
      discountType: 'percentage',
      discountValue: 20,
      minAmount: null, // Pas de minimum
      maxUses: null, // Illimité
      active: true,
      expiresAt: null,
    },
  })

  console.log('✅ Codes promotionnels créés avec succès!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
