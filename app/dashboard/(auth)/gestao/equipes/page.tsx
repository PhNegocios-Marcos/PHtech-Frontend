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

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Equipes_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Equipes_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

          {/* <CustomDateRangePicker /> */}

          {podeCriar && (
            <Button id="Equipes_criar" onClick={() => setIsCadastroOpen(true)}>
              Nova Equipe
            </Button>
          )}
        </div>

        {!isCadastroOpen && <EquipesTable />}

        {/* Modal de cadastro novo usuário */}
        <CadastroUsuarioModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
