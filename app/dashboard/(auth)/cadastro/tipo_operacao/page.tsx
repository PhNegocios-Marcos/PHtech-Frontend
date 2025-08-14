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
    <ProtectedRoute requiredPermission="TipoOperacao_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
          {podeCriar && (
            <Button id="" onClick={() => setIsCadastroOpen(true)}>
              Novo Tipo de Operacao
            </Button>
          )}
        </div>

        {!isCadastroOpen && <SubprodutosTable />}

        <CadastroSubprodutoModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
