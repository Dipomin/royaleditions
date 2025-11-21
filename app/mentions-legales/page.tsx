import { Card } from "@/components/ui/card";

export default function MentionsLegalesPage() {
  return (
    <div className="container-custom py-20 lg:max-w-5xl mx-4 lg:mx-auto">
      <h1 className="font-heading text-4xl font-bold text-royal-blue mb-8">
        Mentions Légales
      </h1>

      <Card className="p-8">
        <div className="prose prose-lg max-w-none prose-headings:text-royal-blue">
          <h2>Éditeur du site</h2>
          <p>
            <strong>Royal Editions</strong>
            <br />
            Abidjan, Côte d&apos;Ivoire
            <br />
            Téléphone : +225 00 00 00 00 00
            <br />
            Email : contact@royaleditions.ci
          </p>

          <h2>Directeur de la publication</h2>
          <p>Royal Editions</p>

          <h2>Hébergement</h2>
          <p>
            Ce site est hébergé par :
            <br />
            [Nom de l&apos;hébergeur]
            <br />
            [Adresse de l&apos;hébergeur]
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble de ce site relève de la législation ivoirienne et
            internationale sur le droit d&apos;auteur et la propriété
            intellectuelle. Tous les droits de reproduction sont réservés, y
            compris pour les documents téléchargeables et les représentations
            iconographiques et photographiques.
          </p>
          <p>
            La reproduction de tout ou partie de ce site sur un support
            électronique ou autre quel qu&apos;il soit, est formellement
            interdite sauf autorisation expresse du directeur de la publication.
          </p>

          <h2>Crédits</h2>
          <p>
            Les photographies, textes, slogans, dessins, images, séquences
            animées sonores ou non ainsi que toutes œuvres intégrées dans le
            site sont la propriété de Royal Editions ou de tiers ayant autorisé
            Royal Editions à les utiliser.
          </p>

          <h2>Liens hypertextes</h2>
          <p>
            Les liens hypertextes mis en place dans le cadre du présent site web
            en direction d&apos;autres ressources présentes sur le réseau
            Internet, et notamment vers ses partenaires ont fait l&apos;objet
            d&apos;une autorisation préalable, expresse et écrite.
          </p>

          <h2>Responsabilité</h2>
          <p>
            Royal Editions ne pourra être tenu responsable des dommages directs
            et indirects causés au matériel de l&apos;utilisateur, lors de
            l&apos;accès au site, et résultant soit de l&apos;utilisation
            d&apos;un matériel ne répondant pas aux spécifications indiquées,
            soit de l&apos;apparition d&apos;un bug ou d&apos;une
            incompatibilité.
          </p>

          <h2>Litiges</h2>
          <p>
            Les présentes mentions légales sont régies par les lois ivoiriennes
            et toute contestation ou litiges qui pourraient naître de
            l&apos;interprétation ou de l&apos;exécution de celles-ci seront de
            la compétence exclusive des tribunaux d&apos;Abidjan.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question ou réclamation, vous pouvez nous contacter :
          </p>
          <ul>
            <li>Par email : contact@royaleditions.ci</li>
            <li>Par téléphone : +225 00 00 00 00 00</li>
            <li>Par courrier : Royal Editions, Abidjan, Côte d&apos;Ivoire</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
