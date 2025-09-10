"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OperacoesTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Credito_criar");
  const { userData } = useAuth();
  const isBanco = userData?.tipo_usuario === "Banco";

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const irParaOutraPagina = () => {
    router.push("simular"); // redireciona para /dashboard
  };

  return (
    <ProtectedRoute requiredPermission="Credito_ver">
      <div className="mb-4 flex flex-wrap justify-between space-y-4">
          <CampoBoasVindas />

          {podeCriar && !isBanco && (
            <Button id="Credito_criar" onClick={irParaOutraPagina}>
              Nova simulação
            </Button>
          )}
        </div>

         <OperacoesTable />
    </ProtectedRoute>
  );
}
