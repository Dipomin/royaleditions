import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const footerLinks = {
    company: [
      { name: "À propos", href: "/a-propos" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
      { name: "FAQ", href: "/faq" },
    ],
    legal: [
      { name: "Conditions générales", href: "/conditions-generales" },
      {
        name: "Politique de confidentialité",
        href: "/politique-confidentialite",
      },
      { name: "Mentions légales", href: "/mentions-legales" },
    ],
    help: [
      { name: "Comment commander", href: "/faq#commande" },
      { name: "Livraison", href: "/faq#livraison" },
      { name: "Paiement", href: "/faq#paiement" },
      { name: "Retours", href: "/faq#retours" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: SITE_CONFIG.links.facebook },
    { name: "Instagram", icon: Instagram, href: SITE_CONFIG.links.instagram },
    { name: "Twitter", icon: Twitter, href: SITE_CONFIG.links.twitter },
  ];

  return (
    <footer className="bg-royal-blue text-white">
      <div className="container-custom py-16 lg:max-w-7xl mx-4 lg:mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src="/assets/Logo-Royal-Editions.png"
              alt="Royal Editions"
              className="h-24 w-auto"
            />
            <p className="text-sm text-gray-300 leading-relaxed">
              Votre librairie premium pour des livres d&apos;exception.
              Découvrez notre sélection exclusive.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gold text-royal-blue p-2 rounded-full hover:bg-gold-dark transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-gold">
              Entreprise
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-gold">
              Aide
            </h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-gold">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">
                  Abidjan, Côte d&apos;Ivoire
                </span>
              </li>

              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm text-gray-300">
                  contact@royaleditions.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-gray-400 hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Royal Editions. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
