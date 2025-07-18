"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubprodutosTable } from "./components/subprodutos";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroSubprodutoModal from "./components/CadastroSubprodutoModal";
import CampoBoasVindas from "@/components/boasvindas";

export default function Page() {
  const podeCriar = useHasPermission("Subprodutos_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Subprodutos_ver">
      <CampoBoasVindas />

      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-end space-x-2">
            {podeCriar && (
              <Button id="Subprodutos_criar" onClick={() => setIsCadastroOpen(true)}>
                Novo Tipo de Operacao
              </Button>
            )}
          </div>

          {!isCadastroOpen && <SubprodutosTable />}

          <CadastroSubprodutoModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
