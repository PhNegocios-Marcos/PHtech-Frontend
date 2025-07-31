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
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)} id="Produtos_criar">
            Novo Produto
          </Button>
        )}
      </div>

      {/* Exibe a tabela somente se modal de cadastro e detalhe não estiverem abertos */}
      {!produtoSelecionado && (
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
    </ProtectedRoute>
  );
}
