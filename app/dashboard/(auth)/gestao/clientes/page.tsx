"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ListaClientes from "./components/clientes";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroClienteModal from "./components/cadastroNovoCliente";
import CampoBoasVindas from "@/components/boasvindas";

export default function Page() {
  const podeCriar = useHasPermission("Clientes_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Clientes_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        
        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)}>
            Novo cliente
          </Button>
        )}
      </div>

      <ListaClientes />

      {isCadastroOpen && (
        <CadastroClienteModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
      )}
    </ProtectedRoute>
  );
}