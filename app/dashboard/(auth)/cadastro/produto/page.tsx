"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProdutosTable, Produto } from "./components/produtos";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroProdutoModal from "./components/CadastroProdutoModal";
import ProdutoDetalhesTabs from "./components/editProduto";

export default function Page() {
  const podeCriar = useHasPermission("Produtos_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Produtos_ver">
      <div className="space-y-4">
        <CampoBoasVindas />

        <div className="flex items-center justify-end">
          {podeCriar && (
            <Button onClick={() => setIsCadastroOpen(true)} id="Produtos_criar">
              Novo Produto
            </Button>
          )}
        </div>

        {/* Exibe a tabela somente se modal de cadastro e detalhe não estiverem abertos */}
        {!isCadastroOpen && !produtoSelecionado && (
          <ProdutosTable onSelectProduto={(produto) => setProdutoSelecionado(produto)} />
        )}

        {/* Exibe as tabs de detalhe quando um produto é selecionado */}
        {produtoSelecionado && (
          <ProdutoDetalhesTabs
            produto={produtoSelecionado}
            onClose={() => setProdutoSelecionado(null)}
          />
        )}

        {/* Modal de cadastro */}
        <CadastroProdutoModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
      </div>
    </ProtectedRoute>
  );
}
