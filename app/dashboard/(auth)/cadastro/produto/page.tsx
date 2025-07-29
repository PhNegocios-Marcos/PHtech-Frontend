"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TaxaProduto from "./components/produtos";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroTabelaModal from "./components/cadastroTabela";
import CampoBoasVindas from "@/components/boasvindas";
import Produto from "./components/produtos";
import { Props } from "./components/produtos";



export default function Page({produto}: Props) {
  const podeCriar = useHasPermission("Subprodutos_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Subprodutos_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        <Button id="" onClick={() => setIsCadastroOpen(true)}>
          Novo Produto
        </Button>
      </div>

      {!isCadastroOpen && <TaxaProduto produto={produto} onClose={handleCloseCadastro} />}

      <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
