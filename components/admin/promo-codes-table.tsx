"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export function PromoCodesTable() {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/promo");
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      toast.error("Erreur lors du chargement des codes promo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/promo/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Code promo supprimé avec succès");
        fetchPromoCodes();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié dans le presse-papier");
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `${value.toLocaleString("fr-FR")} FCFA`;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
      </div>
    );
  }

  if (promoCodes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">Aucun code promo créé</p>
        <Button
          onClick={() => router.push("/admin/promo/nouveau")}
          className="mt-4 bg-royal-blue hover:bg-royal-blue/90"
        >
          Créer le premier code
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Réduction</TableHead>
            <TableHead>Min. commande</TableHead>
            <TableHead>Utilisations</TableHead>
            <TableHead>Expire le</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.map((promo) => {
            const expired = isExpired(promo.expiresAt);
            const limitReached =
              promo.maxUses !== null && promo.usedCount >= promo.maxUses;

            return (
              <TableRow key={promo.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-royal-blue">
                      {promo.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(promo.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {promo.description || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">
                    {formatDiscount(promo.discountType, promo.discountValue)}
                  </span>
                </TableCell>
                <TableCell>
                  {promo.minAmount
                    ? `${promo.minAmount.toLocaleString("fr-FR")} FCFA`
                    : "Aucun"}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {promo.usedCount}
                    {promo.maxUses ? ` / ${promo.maxUses}` : " / ∞"}
                  </span>
                </TableCell>
                <TableCell>
                  {promo.expiresAt
                    ? new Date(promo.expiresAt).toLocaleDateString("fr-FR")
                    : "Jamais"}
                </TableCell>
                <TableCell>
                  {expired ? (
                    <Badge variant="destructive">Expiré</Badge>
                  ) : limitReached ? (
                    <Badge variant="destructive">Épuisé</Badge>
                  ) : promo.active ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/admin/promo/${promo.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(promo.id)}
                      disabled={deletingId === promo.id}
                    >
                      {deletingId === promo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
