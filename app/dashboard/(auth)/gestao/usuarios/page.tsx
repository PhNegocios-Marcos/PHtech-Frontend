"use client";

import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { UsuariosTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

export default function Page() {
  const router = useRouter();
  const podeCriar = useHasPermission("Usuarios_criar");

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between">
        <CampoBoasVindas />
        <div className="mb-4 flex items-center justify-end space-x-2">
          <CustomDateRangePicker />

          {podeCriar && (
            <Button id="Usuarios_criar" onClick={() => router.push("/dashboard/cadastro/usuario")}>
              Novo Usuário
            </Button>
          )}
        </div>
        <UsuariosTable />
      </div>
    </div>
  );
}
