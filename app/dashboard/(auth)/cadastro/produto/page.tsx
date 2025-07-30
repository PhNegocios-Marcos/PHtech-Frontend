"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TaxaProduto from "./components/produtos";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroTabelaModal from "./components/cadastroNovoProduto";
import CampoBoasVindas from "@/components/boasvindas";
export type Produto = {
  id: string;
  nome: string;
  status: number;
  idade_minima: number;
  idade_maxima: number;
  prazo_minimo: number;
  prazo_maximo: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  config_tabela_hash: string;
  usuario_atualizacao: string;
  tabela_hash: string;
  status_relacionamento: any;
  relacionamento_hash: any;
};

export default function Page() {
  const podeCriar = useHasPermission("Subprodutos_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Subprodutos_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        <Button id="" onClick={() => setIsCadastroOpen(true)}>
          Novo Produto
        </Button>
      </div>

      {produtoSelecionado && (
        <TaxaProduto produto={produtoSelecionado} onClose={() => setProdutoSelecionado(null)} />
      )}

      <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
