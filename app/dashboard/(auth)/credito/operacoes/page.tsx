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
    router.push("simular"); // redireciona para /dashboard
  };

  return (
    <ProtectedRoute requiredPermission="Credito_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

          {/* <CustomDateRangePicker /> */}

          {podeCriar && (
            <Button id="Operacoes_criar" onClick={irParaOutraPagina}>
              Nova Simulação
            </Button>
          )}
        </div>

         <OperacoesTable />
    </ProtectedRoute>
  );
}
