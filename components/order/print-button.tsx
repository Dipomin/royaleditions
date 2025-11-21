"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => window.print()}
      className="gap-2"
    >
      <Printer className="h-5 w-5" />
      Imprimer la facture
    </Button>
  );
}
