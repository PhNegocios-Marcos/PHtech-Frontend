"use client";

import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { PermissoesTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";


export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Usuarios_criar");

  return (
    <ProtectedRoute requiredPermission="Gestão_Permissões">
      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <CampoBoasVindas />
          <div className="mb-4 flex items-center justify-end space-x-2">
            <CustomDateRangePicker />

            {podeCriar && (
              <Button onClick={() => router.push("/dashboard/cadastro/promotora")}>
                Nova Promotora
              </Button>
            )}
          </div>
          <PermissoesTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
