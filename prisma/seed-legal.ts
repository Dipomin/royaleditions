import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CGV_CONTENT = `
<h2>1. Objet</h2>
<p>Les présentes Conditions Générales de Vente (CGV) régissent les ventes de livres effectuées par Royal Editions sur son site internet.</p>

<h2>2. Prix</h2>
<p>Les prix sont indiqués en Francs CFA (FCFA) et sont valables au moment de la commande. Royal Editions se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.</p>

<h2>3. Commande</h2>
<p>Toute commande passée sur le site implique l'acceptation des présentes CGV. Le client reconnaît avoir pris connaissance et accepté les présentes conditions générales de vente avant de passer commande.</p>
<p>La vente ne sera considérée comme définitive qu'après l'envoi au client de la confirmation de l'acceptation de la commande par Royal Editions.</p>

<h2>4. Paiement</h2>
<p>Le paiement s'effectue à la livraison, en espèces uniquement. Aucun paiement en ligne n'est requis lors de la commande.</p>
<p>Le montant total dû sera remis au livreur lors de la réception de votre commande.</p>

<h2>5. Livraison</h2>
<p>Les livraisons sont effectuées à l'adresse indiquée par le client lors de la commande.</p>
<p>Les délais de livraison sont donnés à titre indicatif et peuvent varier en fonction de la disponibilité des produits et de la zone de livraison.</p>
<p>Notre service de livraison vous contactera pour confirmer l'adresse et convenir d'un horaire de livraison.</p>

<h2>6. Droit de rétractation</h2>
<p>Conformément à la législation en vigueur, le client dispose d'un délai de 7 jours à compter de la réception de sa commande pour exercer son droit de rétractation.</p>
<p>Pour exercer ce droit, le client doit nous contacter par téléphone ou email et renvoyer le(s) produit(s) dans leur emballage d'origine, en parfait état.</p>

<h2>7. Garantie</h2>
<p>Tous nos livres sont neufs et en parfait état. En cas de défaut ou de dommage lors de la livraison, veuillez nous contacter immédiatement.</p>
<p>Un remplacement sera effectué dans les meilleurs délais.</p>

<h2>8. Responsabilité</h2>
<p>Royal Editions ne saurait être tenu responsable de l'inexécution du contrat en cas de rupture de stock, d'indisponibilité du produit, de force majeure, de perturbation ou grève totale ou partielle des services postaux ou de moyens de transport et/ou communications.</p>

<h2>9. Protection des données personnelles</h2>
<p>Les informations recueillies font l'objet d'un traitement informatique destiné à la gestion des commandes. Conformément à la loi, vous disposez d'un droit d'accès, de modification et de suppression des données vous concernant.</p>

<h2>10. Litiges</h2>
<p>Les présentes CGV sont soumises au droit ivoirien. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.</p>

<h2>11. Contact</h2>
<p>Pour toute question concernant nos conditions générales de vente, vous pouvez nous contacter :</p>
<ul>
  <li>Par téléphone : +225 00 00 00 00 00</li>
  <li>Par email : contact@royaleditions.ci</li>
  <li>Par courrier : Abidjan, Côte d'Ivoire</li>
</ul>
`

const PRIVACY_CONTENT = `
<h2>1. Introduction</h2>
<p>Royal Editions attache une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.</p>

<h2>2. Données collectées</h2>
<p>Nous collectons les informations suivantes lors de votre commande :</p>
<ul>
  <li>Nom complet</li>
  <li>Numéro de téléphone</li>
  <li>Adresse email (optionnel)</li>
  <li>Adresse de livraison complète</li>
</ul>

<h2>3. Utilisation des données</h2>
<p>Vos données personnelles sont utilisées uniquement pour :</p>
<ul>
  <li>Traiter et livrer votre commande</li>
  <li>Vous contacter concernant votre commande</li>
  <li>Améliorer nos services</li>
  <li>Vous envoyer des informations sur nos produits (avec votre consentement)</li>
</ul>

<h2>4. Partage des données</h2>
<p>Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers.</p>
<p>Vos données peuvent être partagées uniquement avec :</p>
<ul>
  <li>Notre service de livraison (uniquement les informations nécessaires à la livraison)</li>
  <li>Les autorités compétentes si la loi l'exige</li>
</ul>

<h2>5. Sécurité des données</h2>
<p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction.</p>
<p>Nos systèmes sont protégés et régulièrement mis à jour pour garantir la sécurité de vos informations.</p>

<h2>6. Conservation des données</h2>
<p>Vos données personnelles sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, conformément aux obligations légales de conservation.</p>

<h2>7. Vos droits</h2>
<p>Conformément à la réglementation en vigueur, vous disposez des droits suivants :</p>
<ul>
  <li>Droit d'accès à vos données personnelles</li>
  <li>Droit de rectification de vos données</li>
  <li>Droit à l'effacement de vos données</li>
  <li>Droit d'opposition au traitement de vos données</li>
  <li>Droit à la portabilité de vos données</li>
</ul>
<p>Pour exercer ces droits, contactez-nous à : contact@royaleditions.ci</p>

<h2>8. Cookies</h2>
<p>Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies nous permettent de :</p>
<ul>
  <li>Mémoriser votre panier d'achat</li>
  <li>Analyser l'utilisation de notre site</li>
  <li>Personnaliser votre expérience</li>
</ul>
<p>Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais cela peut affecter certaines fonctionnalités du site.</p>

<h2>9. Modifications</h2>
<p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page.</p>
<p>Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques en matière de confidentialité.</p>

<h2>10. Contact</h2>
<p>Pour toute question concernant cette politique de confidentialité ou vos données personnelles, vous pouvez nous contacter :</p>
<ul>
  <li>Par email : contact@royaleditions.ci</li>
  <li>Par téléphone : +225 00 00 00 00 00</li>
  <li>Par courrier : Royal Editions, Abidjan, Côte d'Ivoire</li>
</ul>
`

async function seedLegalPages() {
  console.log('🌱 Création des pages légales...')

  try {
    // CGV
    const cgv = await prisma.legalPage.upsert({
      where: { slug: 'cgv' },
      update: {},
      create: {
        slug: 'cgv',
        title: 'Conditions Générales de Vente',
        content: CGV_CONTENT.trim(),
        published: true,
      },
    })
    console.log('✅ CGV créées:', cgv.title)

    // Politique de confidentialité
    const privacy = await prisma.legalPage.upsert({
      where: { slug: 'confidentialite' },
      update: {},
      create: {
        slug: 'confidentialite',
        title: 'Politique de Confidentialité',
        content: PRIVACY_CONTENT.trim(),
        published: true,
      },
    })
    console.log('✅ Politique de confidentialité créée:', privacy.title)

    console.log('✨ Pages légales créées avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la création des pages légales:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedLegalPages()
