import { Metadata } from "next";
import { PromoCodeForm } from "@/components/admin/promo-code-form";

export const metadata: Metadata = {
  title: "Nouveau Code Promo - Admin",
  description: "Créer un nouveau code promotionnel",
};

export default function NewPromoCodePage() {
  return <PromoCodeForm />;
}
