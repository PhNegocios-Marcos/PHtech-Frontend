"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProdutosTable } from "./components/produtos";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroProdutoModal from "./components/CadastroProdutoModal";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Produtos_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Produtos_ver">
      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <CampoBoasVindas />

          <div className="mb-4 flex items-center justify-end space-x-2">
            {podeCriar && (
              <Button id="Produtos_criar" onClick={() => setIsCadastroOpen(true)}>
                Novo Produto
              </Button>
            )}
          </div>

          {!isCadastroOpen && <ProdutosTable />}

          <CadastroProdutoModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
        </div>
      </div>
    </ProtectedRoute>
  );
}