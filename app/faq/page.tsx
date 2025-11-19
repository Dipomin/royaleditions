import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ - Questions Fréquentes",
  description:
    "Trouvez des réponses aux questions les plus fréquentes sur Royal Editions",
};

const faqs = [
  {
    category: "Commande",
    questions: [
      {
        question: "Comment passer une commande ?",
        answer:
          'Parcourez notre boutique, ajoutez les livres souhaités au panier, puis cliquez sur "Passer la commande". Remplissez le formulaire de livraison avec vos coordonnées et validez. Vous recevrez un numéro de commande par confirmation.',
      },
      {
        question: "Puis-je modifier ma commande après validation ?",
        answer:
          "Oui, contactez-nous immédiatement après la validation de votre commande via notre numéro WhatsApp ou par email. Les modifications ne sont possibles que si la commande n'est pas encore en préparation.",
      },
      {
        question: "Comment suivre ma commande ?",
        answer:
          "Vous recevrez des notifications par SMS et/ou email à chaque étape : confirmation, préparation, expédition et livraison. Vous pouvez également nous contacter avec votre numéro de commande pour obtenir le statut.",
      },
    ],
  },
  {
    category: "Livraison",
    questions: [
      {
        question: "Quels sont les délais de livraison ?",
        answer:
          "Les délais varient selon votre localisation : Abidjan (1-2 jours ouvrables), Intérieur du pays (3-5 jours ouvrables). Les commandes sont traitées du lundi au samedi.",
      },
      {
        question: "Quels sont les frais de livraison ?",
        answer:
          "Les frais de livraison dépendent de votre zone géographique. Ils sont calculés et affichés lors de la confirmation de commande. La livraison est gratuite à partir d'un certain montant d'achat (voir promotions en cours).",
      },
      {
        question: "Livrez-vous dans toute la Côte d'Ivoire ?",
        answer:
          "Oui, nous livrons dans toutes les villes de Côte d'Ivoire. Pour les zones éloignées, les délais peuvent être légèrement plus longs.",
      },
      {
        question:
          "Que faire si je ne suis pas disponible lors de la livraison ?",
        answer:
          "Notre livreur vous contactera avant de se déplacer. Si vous n'êtes pas disponible, vous pouvez reprogrammer la livraison ou désigner une personne de confiance pour réceptionner le colis.",
      },
    ],
  },
  {
    category: "Paiement",
    questions: [
      {
        question: "Quels modes de paiement acceptez-vous ?",
        answer:
          "Actuellement, nous acceptons uniquement le paiement en espèces à la livraison. Vous payez directement au livreur lorsque vous recevez votre commande.",
      },
      {
        question: "Le paiement à la livraison est-il sécurisé ?",
        answer:
          "Oui, absolument. Nos livreurs sont des professionnels formés et vous remettent un reçu officiel lors du paiement. Vous pouvez inspecter votre commande avant de payer.",
      },
      {
        question: "Proposez-vous le paiement en ligne ?",
        answer:
          "Pour le moment, seul le paiement à la livraison est disponible. Les options de paiement en ligne (Mobile Money, carte bancaire) seront ajoutées prochainement.",
      },
    ],
  },
  {
    category: "Retours & Échanges",
    questions: [
      {
        question: "Puis-je retourner un livre ?",
        answer:
          "Oui, vous disposez de 7 jours après réception pour retourner un livre non ouvert et en parfait état. Les frais de retour sont à votre charge sauf en cas de défaut ou d'erreur de notre part.",
      },
      {
        question: "Comment faire une réclamation ?",
        answer:
          "Contactez notre service client dans les 48h suivant la réception avec votre numéro de commande et des photos du problème. Nous traiterons votre demande rapidement.",
      },
      {
        question: "Proposez-vous des échanges ?",
        answer:
          "Oui, si vous souhaitez échanger un livre contre un autre, contactez-nous dans les 7 jours. L'échange est possible sous réserve de disponibilité.",
      },
    ],
  },
  {
    category: "Produits",
    questions: [
      {
        question: "Les livres sont-ils neufs ?",
        answer:
          "Oui, tous nos livres sont 100% neufs et authentiques. Nous travaillons directement avec des éditeurs et distributeurs officiels.",
      },
      {
        question: "Proposez-vous des livres numériques ?",
        answer:
          "Pour le moment, nous vendons uniquement des livres physiques. Les versions numériques seront disponibles prochainement.",
      },
      {
        question: "Comment choisir le bon livre ?",
        answer:
          "Consultez les descriptions détaillées, avis clients et catégories. Vous pouvez aussi nous contacter pour des recommandations personnalisées basées sur vos intérêts.",
      },
      {
        question: "Puis-je commander un livre qui n'est pas en stock ?",
        answer:
          "Oui, contactez-nous. Nous pouvons commander des livres sur demande. Le délai de livraison sera plus long (2-4 semaines selon disponibilité).",
      },
    ],
  },
  {
    category: "Compte Client",
    questions: [
      {
        question: "Dois-je créer un compte pour commander ?",
        answer:
          "Non, vous pouvez commander sans créer de compte. Cependant, créer un compte vous permet de suivre vos commandes et de bénéficier d'offres exclusives.",
      },
      {
        question: "Comment créer un compte ?",
        answer:
          'Lors de votre première commande, vous pouvez choisir de créer un compte. Sinon, cliquez sur "Mon compte" dans le menu et suivez les instructions.',
      },
      {
        question: "J'ai oublié mon mot de passe ?",
        answer:
          'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email pour réinitialiser votre mot de passe.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container-custom py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-royal-blue mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-xl text-gray-600">
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="font-heading text-2xl font-bold text-royal-blue mb-4 flex items-center">
                <span className="bg-gold w-2 h-8 mr-3 rounded"></span>
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${section.category}-${index}`}
                    className="bg-white rounded-lg shadow-sm px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-royal-blue">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-linear-to-br from-gold/10 to-gold/5 rounded-lg text-center">
          <h3 className="font-heading text-2xl font-bold text-royal-blue mb-3">
            Vous ne trouvez pas votre réponse ?
          </h3>
          <p className="text-gray-600 mb-6">
            Notre équipe est là pour vous aider
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="btn-gold inline-flex items-center px-6 py-3 rounded-lg font-semibold"
            >
              Nous contacter
            </a>
            <a
              href="tel:+22500000000"
              className="btn-royal-blue inline-flex items-center px-6 py-3 rounded-lg font-semibold"
            >
              Appeler maintenant
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
