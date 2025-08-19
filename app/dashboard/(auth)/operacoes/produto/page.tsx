"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroCompletoModal from "./components/novoProduto";
import CampoBoasVindas from "@/components/boasvindas";
import TabelaProduto from "./components/tableProduto";


export default function Page() {
  const podeCriar = useHasPermission("Subprodutos_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Produto_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        <Button id="" onClick={() => setIsCadastroOpen(true)}>
          Novo Produto
        </Button>
      </div>

      {!isCadastroOpen && <TabelaProduto onClose={handleCloseCadastro} />}

      <CadastroCompletoModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
