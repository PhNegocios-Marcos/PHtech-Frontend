"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

export default function Page() {
  const podeCriar = useHasPermission("Produtos_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Averbador_Ver">
      <div className="space-y-4 flex justify-between">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)} id="Produtos_criar">
            Novo Averbador
          </Button>
        )}
      </div>
    </ProtectedRoute>
  );
}
