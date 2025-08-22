"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlcadasTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroAlcadaModal from "./components/CadastroAlcadaModal";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Alcadas_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleNewAlcadaClick = () => {
    if (!podeCriar) {
      toast.error("Sem permissão", {
        description: "Você não tem permissão para criar novas alçadas",
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }
    setIsCadastroOpen(true);
  };

  return (
    <ProtectedRoute requiredPermission="Alcadas_ver">
      <div className="space-y-4">
        <div className="mb-4 flex justify-between space-y-4">
          <CampoBoasVindas />
          <div className="mb-4 flex items-center justify-end space-x-2">
            <Button
              onClick={handleNewAlcadaClick}
              aria-label="Criar nova alçada"
              disabled={!podeCriar}>
              Nova Alçada
            </Button>
          </div>
        </div>
        <AlcadasTable />
        <CadastroAlcadaModal isOpen={isCadastroOpen} onClose={() => setIsCadastroOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
