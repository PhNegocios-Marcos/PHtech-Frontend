"use client";

import { Button } from "@/components/ui/button";
import { ModulosTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import CadastroModulosModal from "./components/CadastroModulosModal";


export default function Page() {
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Gestão_Permissões">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        <Button onClick={() => setIsCadastroOpen(true)}>Novo Módulo</Button>
      </div>

      <ModulosTable />

      <CadastroModulosModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
