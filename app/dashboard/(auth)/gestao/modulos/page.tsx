"use client";

import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { ModulosTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  const router = useRouter();

  return (
    <ProtectedRoute requiredPermission="Gestão_Permissões">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        <div className="mb-4 flex items-center justify-end space-x-2">
          <CustomDateRangePicker />
          <Button onClick={() => router.push("/dashboard/cadastro/usuario")}>Novo Usuario</Button>
        </div>
        <ModulosTable />
      </div>
    </ProtectedRoute>
  );
}
