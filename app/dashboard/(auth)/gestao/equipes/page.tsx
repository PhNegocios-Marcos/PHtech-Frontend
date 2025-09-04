"use client";

import { useState } from "react";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { EquipesTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroUsuarioModal from "./components/CadastroEquipesModal";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Equipes_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => {
    setIsCadastroOpen(false);
    toast.success("Equipe criada com sucesso!", {
      style: {
        background: 'var(--toast-success)',
        color: 'var(--toast-success-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  const handleOpenCadastro = () => {
    if (!podeCriar) {
      toast.error("Sem permissão", {
        description: "Você não tem permissão para criar novas equipes",
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }
    setIsCadastroOpen(true);
  };

  return (
    <ProtectedRoute requiredPermission="Equipes_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        {/* <CustomDateRangePicker /> */}

        {podeCriar && (
          <Button 
            id="Equipes_criar" 
            onClick={handleOpenCadastro}
            aria-label="Criar nova equipe"
          >
            Nova equipe
          </Button>
        )}
      </div>

       <EquipesTable />
      
      <CadastroUsuarioModal 
        isOpen={isCadastroOpen} 
        onClose={handleCloseCadastro} 
      />
    </ProtectedRoute>
  );
}