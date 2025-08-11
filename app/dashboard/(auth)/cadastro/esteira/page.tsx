"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CampoBoasVindas from "@/components/boasvindas";
import Esteira from "./components/esteira";
import CadatroEsteira from "./components/cadastrarEsteira";

export default function Page() {
  const podeCriar = useHasPermission("Subprodutos_criar");
  const [isEsteiraOpen, setIsEsteiraOpen] = useState(false);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [selectedEsteiraHash, setSelectedEsteiraHash] = useState<any>(null);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  const handleCloseEsteira = () => {
    setIsEsteiraOpen(false);
    setSelectedEsteiraHash(null);
  };

  return (
    <ProtectedRoute requiredPermission="Subprodutos_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        {podeCriar && <Button onClick={() => setIsCadastroOpen(true)}>Nova Esteira</Button>}
      </div>

      {!isEsteiraOpen && (
        <Esteira
          esteira={selectedEsteiraHash}
          esteiraHash={selectedEsteiraHash}
          onClose={handleCloseEsteira}
        />
      )}

      <CadatroEsteira isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
