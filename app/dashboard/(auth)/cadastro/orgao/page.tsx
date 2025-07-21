"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import { Orgao } from "./components/leads";
import CadastroOrgao from "./components/cadastroOrgao";

export default function Page() {
  const podeCriar = useHasPermission("Produtos_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Orgao | null>(null);
  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Orgao_Ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)} id="Produtos_criar">
            Novo Orgão
          </Button>
        )}
      </div>

      {!isCadastroOpen && !produtoSelecionado && (
        <Orgao onSelectProduto={(produto) => setProdutoSelecionado(produto)} />
      )}

      <CadastroOrgao isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
