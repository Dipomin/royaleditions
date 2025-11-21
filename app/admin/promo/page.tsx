import { Metadata } from "next";
import { PromoCodesTable } from "@/components/admin/promo-codes-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Codes Promotionnels - Admin",
  description: "Gérer les codes promotionnels",
};

export default function PromoCodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-royal-blue">
            Codes Promotionnels
          </h1>
          <p className="text-gray-600 mt-2">
            Créez et gérez vos codes de réduction
          </p>
        </div>
        <Link href="/admin/promo/nouveau">
          <Button className="bg-gold hover:bg-gold-dark text-royal-blue">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau code promo
          </Button>
        </Link>
      </div>

      <PromoCodesTable />
    </div>
  );
}
