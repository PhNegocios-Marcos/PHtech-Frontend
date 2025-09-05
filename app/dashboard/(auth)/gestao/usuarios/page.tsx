"use client";

import { useState } from "react";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { UsuariosTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroUsuarioModal from "./components/CadastroUsuarioModal";
import Equipes from "./components/equipe";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Usuarios_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Usuarios_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

          {/* <CustomDateRangePicker /> */}

          {podeCriar && (
            <Button id="Usuarios_criar" onClick={() => setIsCadastroOpen(true)}>
              Novo usuário
            </Button>
          )}
        </div>

         <UsuariosTable />

        {/* Modal de cadastro novo usuário */}
        <CadastroUsuarioModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
