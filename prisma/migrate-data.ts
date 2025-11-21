import { PrismaClient } from '@prisma/client'

// Base de données source (locale)
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SOURCE_DATABASE_URL || 'mysql://royaledition_user:Logik1981@localhost:3306/royaledition'
    }
  }
})

// Base de données destination (VPS)
const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TARGET_DATABASE_URL || 'mysql://royaledition_user:Logik1981@178.18.254.232:3306/royaledition'
    }
  }
})

async function migrateData() {
  console.log('🚀 Début de la migration des données...')
  console.log('==========================================')
  console.log('')

  try {
    // 1. Migrer les catégories
    console.log('📁 Migration des catégories...')
    const categories = await sourceDb.category.findMany()
    let categoryCount = 0
    for (const category of categories) {
      await targetDb.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      })
      categoryCount++
      process.stdout.write(`\r  Progression: ${categoryCount}/${categories.length}`)
    }
    console.log(`\n✓ ${categories.length} catégories migrées\n`)

    // 2. Migrer les livres
    console.log('📚 Migration des livres...')
    const books = await sourceDb.book.findMany()
    let bookCount = 0
    for (const book of books) {
      await targetDb.book.upsert({
        where: { id: book.id },
        update: book,
        create: book,
      })
      bookCount++
      process.stdout.write(`\r  Progression: ${bookCount}/${books.length}`)
    }
    console.log(`\n✓ ${books.length} livres migrés\n`)

    // 3. Migrer les commandes et leurs items
    console.log('🛒 Migration des commandes...')
    const orders = await sourceDb.order.findMany({
      include: { items: true }
    })
    let orderCount = 0
    for (const order of orders) {
      // Migrer la commande
      await targetDb.order.upsert({
        where: { id: order.id },
        update: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingCity: order.shippingCity,
          shippingArea: order.shippingArea,
          shippingAddress: order.shippingAddress,
          observations: order.observations,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        create: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingCity: order.shippingCity,
          shippingArea: order.shippingArea,
          shippingAddress: order.shippingAddress,
          observations: order.observations,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      })

      // Migrer les items de la commande
      for (const item of order.items) {
        await targetDb.orderItem.upsert({
          where: { id: item.id },
          update: item,
          create: item,
        })
      }

      orderCount++
      process.stdout.write(`\r  Progression: ${orderCount}/${orders.length}`)
    }
    console.log(`\n✓ ${orders.length} commandes migrées\n`)

    // 4. Migrer les articles de blog
    console.log('📝 Migration des articles de blog...')
    const blogPosts = await sourceDb.blogPost.findMany()
    let postCount = 0
    for (const post of blogPosts) {
      await targetDb.blogPost.upsert({
        where: { id: post.id },
        update: post,
        create: post,
      })
      postCount++
      process.stdout.write(`\r  Progression: ${postCount}/${blogPosts.length}`)
    }
    console.log(`\n✓ ${blogPosts.length} articles migrés\n`)

    // 5. Migrer les pages légales
    console.log('⚖️ Migration des pages légales...')
    const legalPages = await sourceDb.legalPage.findMany()
    let legalCount = 0
    for (const page of legalPages) {
      await targetDb.legalPage.upsert({
        where: { id: page.id },
        update: page,
        create: page,
      })
      legalCount++
      process.stdout.write(`\r  Progression: ${legalCount}/${legalPages.length}`)
    }
    console.log(`\n✓ ${legalPages.length} pages légales migrées\n`)

    // 6. Migrer les témoignages
    console.log('⭐ Migration des témoignages...')
    const testimonials = await sourceDb.testimonial.findMany()
    let testimonialCount = 0
    for (const testimonial of testimonials) {
      await targetDb.testimonial.upsert({
        where: { id: testimonial.id },
        update: testimonial,
        create: testimonial,
      })
      testimonialCount++
      process.stdout.write(`\r  Progression: ${testimonialCount}/${testimonials.length}`)
    }
    console.log(`\n✓ ${testimonials.length} témoignages migrés\n`)

    // 7. Migrer les conversations de chat
    console.log('💬 Migration des conversations de chat...')
    const conversations = await sourceDb.chatConversation.findMany({
      include: { messages: true }
    })
    let convCount = 0
    for (const conv of conversations) {
      // Migrer la conversation
      await targetDb.chatConversation.upsert({
        where: { id: conv.id },
        update: {
          visitorId: conv.visitorId,
          visitorName: conv.visitorName,
          visitorEmail: conv.visitorEmail,
          status: conv.status,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        },
        create: {
          id: conv.id,
          visitorId: conv.visitorId,
          visitorName: conv.visitorName,
          visitorEmail: conv.visitorEmail,
          status: conv.status,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        },
      })

      // Migrer les messages de la conversation
      for (const msg of conv.messages) {
        await targetDb.chatMessage.upsert({
          where: { id: msg.id },
          update: msg,
          create: msg,
        })
      }

      convCount++
      process.stdout.write(`\r  Progression: ${convCount}/${conversations.length}`)
    }
    console.log(`\n✓ ${conversations.length} conversations migrées\n`)

    // Résumé final
    console.log('==========================================')
    console.log('✨ Migration terminée avec succès!')
    console.log('==========================================')
    console.log('')
    console.log('📊 Résumé :')
    console.log(`  • ${categories.length} catégories`)
    console.log(`  • ${books.length} livres`)
    console.log(`  • ${orders.length} commandes`)
    console.log(`  • ${blogPosts.length} articles de blog`)
    console.log(`  • ${legalPages.length} pages légales`)
    console.log(`  • ${testimonials.length} témoignages`)
    console.log(`  • ${conversations.length} conversations`)
    console.log('')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await sourceDb.$disconnect()
    await targetDb.$disconnect()
  }
}

// Exécuter la migration
migrateData()
  .catch((error) => {
    console.error('Migration échouée:', error)
    process.exit(1)
  })
