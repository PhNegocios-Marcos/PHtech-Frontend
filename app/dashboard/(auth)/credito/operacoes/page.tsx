"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OperacoesTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Operacoes_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

   const irParaOutraPagina = () => {
    router.push('simular'); // redireciona para /dashboard
  };

  return (
    <ProtectedRoute requiredPermission="Operacoes_ver">
      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <CampoBoasVindas />

          <div className="mb-4 flex items-center justify-end space-x-2">
            {/* <CustomDateRangePicker /> */}

            {podeCriar && (
              <Button id="Operacoes_criar" onClick={irParaOutraPagina}>
                Nova Simulação
              </Button>
            )}
          </div>


          {!isCadastroOpen && <OperacoesTable />}

        </div>
      </div>
    </ProtectedRoute>
  );
}
