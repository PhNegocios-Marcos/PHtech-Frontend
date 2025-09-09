"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EquipesTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroUsuarioModal from "./components/CadastroEquipesModal";
import { toast } from "sonner";
import toastComponent from "@/utils/toastComponent";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Equipes_criar");
  const bankUser = 0;
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => {
    setIsCadastroOpen(false);
  };

  const handleOpenCadastro = () => {
    if (!podeCriar) {
      toastComponent.error("Sem permissão", {description: "Você não tem permissão para criar novas equipes"});
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