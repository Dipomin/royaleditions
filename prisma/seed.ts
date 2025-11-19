import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer des catégories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Développement Personnel',
        slug: 'developpement-personnel',
        description: 'Livres pour améliorer votre vie personnelle et professionnelle',
        metaTitle: 'Développement Personnel | Royal Editions',
        metaDescription: 'Découvrez nos livres de développement personnel',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Business & Entrepreneuriat',
        slug: 'business-entrepreneuriat',
        description: 'Guides et stratégies pour entrepreneurs et leaders',
        metaTitle: 'Business & Entrepreneuriat | Royal Editions',
        metaDescription: 'Livres sur le business et l\'entrepreneuriat',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Techniques & Savoir-faire',
        slug: 'techniques-savoir-faire',
        description: 'Guides pratiques et techniques professionnelles',
        metaTitle: 'Techniques & Savoir-faire | Royal Editions',
        metaDescription: 'Guides techniques et pratiques',
      },
    }),
  ])

  console.log('✅ Catégories créées')

  // Créer des livres
  await prisma.book.create({
    data: {
      title: '1000 Techniques Professionnelles',
      slug: '1000-techniques-professionnelles',
      author: 'Expert Team',
      summary: 'Un guide complet de 1000 techniques pour exceller dans votre domaine professionnel.',
      description: `<h2>Description complète</h2>
        <p>Ce livre est une ressource inestimable pour tous les professionnels souhaitant développer leurs compétences et maîtriser les techniques essentielles de leur domaine.</p>
        <h3>Ce que vous apprendrez :</h3>
        <ul>
          <li>Techniques de productivité avancées</li>
          <li>Méthodes de résolution de problèmes</li>
          <li>Stratégies de communication efficace</li>
          <li>Outils de gestion de projet</li>
        </ul>
        <p>Avec des exemples concrets et des exercices pratiques, ce guide vous accompagne dans votre développement professionnel.</p>`,
      price: 25000,
      originalPrice: 30000,
      stock: 50,
      images: JSON.stringify([
        '/assets/1000_techniques_book_2.png',
        '/assets/1000_techniques_book_2_transparent.png',
      ]),
      categoryId: categories[2].id,
      featured: true,
      bestseller: true,
      metaTitle: '1000 Techniques Professionnelles - Guide Complet',
      metaDescription: 'Maîtrisez 1000 techniques essentielles pour exceller dans votre carrière professionnelle.',
    },
  })

  console.log('✅ Livres créés')

  // Créer des témoignages
  await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Kouadio Marie',
        role: 'Entrepreneure',
        content: 'Les livres de Royal Editions ont transformé ma vision du business. Service excellent et livraison rapide!',
        rating: 5,
        active: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Yao Jean',
        role: 'Étudiant',
        content: 'Collection exceptionnelle de livres. Le paiement à la livraison est très pratique.',
        rating: 5,
        active: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Adjoua Aya',
        role: 'Manager',
        content: 'Royal Editions est ma librairie préférée. Qualité premium et conseils personnalisés.',
        rating: 5,
        active: true,
      },
    }),
  ])

  console.log('✅ Témoignages créés')

  // Créer un article de blog
  await prisma.blogPost.create({
    data: {
      title: 'Bienvenue sur Royal Editions',
      slug: 'bienvenue-royal-editions',
      excerpt: 'Découvrez notre nouvelle librairie en ligne premium dédiée aux livres d\'exception.',
      content: `<h2>Une nouvelle ère pour la lecture en Côte d'Ivoire</h2>
        <p>Royal Editions est fière de vous présenter sa plateforme e-commerce dédiée aux livres de qualité premium.</p>
        <h3>Notre mission</h3>
        <p>Rendre accessible à tous les Ivoiriens des livres d'exception qui transforment les vies et enrichissent les connaissances.</p>
        <h3>Nos engagements</h3>
        <ul>
          <li>Sélection rigoureuse de livres de qualité</li>
          <li>Livraison rapide dans toute la Côte d'Ivoire</li>
          <li>Paiement sécurisé à la livraison</li>
          <li>Service client réactif</li>
        </ul>
        <p>Rejoignez notre communauté de lecteurs passionnés!</p>`,
      coverImage: '/assets/Logo-Royal-Editions.png',
      author: 'Royal Editions',
      published: true,
      metaTitle: 'Bienvenue sur Royal Editions - Votre librairie premium',
      metaDescription: 'Découvrez Royal Editions, votre nouvelle librairie en ligne en Côte d\'Ivoire',
    },
  })

  console.log('✅ Article de blog créé')

  console.log('🎉 Seeding terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
