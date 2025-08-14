"use client";

import { Button } from "@/components/ui/button";
import { AlcadasTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Alcadas_criar");

  const handleNewAlcadaClick = () => {
    if (!podeCriar) {
      toast.error("Sem permissão", {
        description: "Você não tem permissão para criar novas alçadas",
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }
    router.push("/dashboard/cadastro/alcada");
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
              disabled={!podeCriar}
            >
              Nova Alçada
            </Button>
          </div>
        </div>
        <AlcadasTable />
      </div>
    </ProtectedRoute>
  );
}