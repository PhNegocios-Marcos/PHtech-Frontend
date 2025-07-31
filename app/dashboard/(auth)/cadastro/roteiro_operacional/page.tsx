"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RoteiroOperacionalTable from "./components/cadstroRO";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroRoteiroModal from "./components/ROTable";
import CampoBoasVindas from "@/components/boasvindas";

export default function RoteiroOperacionalPage() {
  const podeCriar = useHasPermission("RoteiroOperacional_criar");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <ProtectedRoute requiredPermission="RoteiroOperacional_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        {podeCriar && (
          <Button onClick={() => setIsModalOpen(true)} className="rounded-md text-white transition-colors">
            Cadastrar Roteiro
          </Button>
        )}
      </div>

      <RoteiroOperacionalTable onSuccess={handleCloseModal} isOpen={isModalOpen} onClose={handleCloseModal} />

      <CadastroRoteiroModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </ProtectedRoute>
  );
}