"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TaxaProduto from "./components/produtos";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroTabelaModal from "./components/cadastroTabela";
import CampoBoasVindas from "@/components/boasvindas";
import Produto from "./components/produtos";

export type Produto = {
  id?: string;
  nome?: string;
  status?: number;
  idade_minima?: number;
  idade_maxima?: number;
  prazo_minimo?: number;
  prazo_maximo?: number;
  id_uy3?: string | null;
  cor_grafico?: string | null;
  config_tabela_hash?: string;
  usuario_atualizacao?: string;
  tabela_hash?: string;
};

type Props = {
  produto: Produto;
  onClose: () => void;
};


export default function Page({produto}: Props) {
  const podeCriar = useHasPermission("Subprodutos_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Subprodutos_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        <Button onClick={() => setIsCadastroOpen(true)}>Novo Produto</Button>
      </div>

      {!isCadastroOpen && <TaxaProduto produto={produto} onClose={handleCloseCadastro} />}
      <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}

