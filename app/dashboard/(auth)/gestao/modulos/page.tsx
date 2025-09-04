// Arquivo: page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ModulosTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import CadastroModulosModal from "./components/CadastroModulosModal";
import { toast } from "sonner";

export default function Page() {
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => {
    setIsCadastroOpen(false);
    // toast.success("Módulo cadastrado com sucesso!", {
    //   style: {
    //     background: 'var(--toast-success)',
    //     color: 'var(--toast-success-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
  };

  const handleOpenCadastro = () => {
    setIsCadastroOpen(true);
  };

  return (
    <ProtectedRoute requiredPermission="Gestão_Permissões">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        <Button onClick={handleOpenCadastro}>Novo módulo</Button>
      </div>

      <ModulosTable />

      <CadastroModulosModal 
        isOpen={isCadastroOpen} 
        onClose={handleCloseCadastro} 
      />
    </ProtectedRoute>
  );
}