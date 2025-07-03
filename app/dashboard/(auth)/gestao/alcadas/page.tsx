"use client";

import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { AlcadasTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  const router = useRouter();

  return (
    <ProtectedRoute requiredPermission="Alcadas_ver">
      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <CampoBoasVindas />
          <div className="mb-4 flex items-center justify-end space-x-2">
            <CustomDateRangePicker />
            <Button onClick={() => router.push("/dashboard/cadastro/usuario")}>Novo Alçada</Button>
          </div>
          <AlcadasTable />
        </div>
      </div>
    </ProtectedRoute>
  );
}
