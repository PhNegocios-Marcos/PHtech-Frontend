"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { CarregandoTable } from "./leads_carregando";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { EquipeEditForm } from "../components/editarPromotora";
import { Pencil } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type PermissaoLinha = {
  categoria: string;
  id: string;
  nome: string;
  status: number;
};

export function PermissoesTable() {
  const { token } = useAuth();
  const [permissoes, setPermissoes] = React.useState<PermissaoLinha[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedPermissao, setSelectedPermissao] = React.useState<PermissaoLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const router = useRouter();

   useEffect(() => {
     const timeout = setTimeout(() => {
       if (!token) {
         toast.error("Token de autenticação não encontrado", {
           style: {
             background: "var(--toast-error)",
             color: "var(--toast-error-foreground)",
             boxShadow: "var(--toast-shadow)"
           }
         });
         sessionStorage.clear();
         router.push("/dashboard/login");
       } else {
         // console.log("tem token");
       }
     }, 2000);
 
     return () => clearTimeout(timeout);
   }, [token, router]);

  useEffect(() => {
    async function fetchPermissoes() {
      if (!token) {
        toast.error("Autenticação necessária", {
          description: "Faça login para acessar as permissões",
        });
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/permissoes/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar permissões");
        const data = await res.json();

        const lista: PermissaoLinha[] = [];
        for (const [categoria, permissoesArray] of Object.entries(data)) {
          for (const p of permissoesArray as any[]) {
            lista.push({
              categoria,
              id: p.id,
              nome: p.nome,
              status: p.status
            });
          }
        }
        setPermissoes(lista);
      } catch (error) {
        toast.error("Falha ao carregar permissões. Tente novamente mais tarde.");
      }
    }
    fetchPermissoes();
  }, [token, refreshKey]);

  const filteredPermissoes = React.useMemo(() => {
    const filtroLower = globalFilter.toLowerCase();
    return permissoes.filter(
      (p) =>
        p.nome.toLowerCase().includes(filtroLower) ||
        p.categoria.toLowerCase().includes(filtroLower)
    );
  }, [globalFilter, permissoes]);

  const columns: ColumnDef<PermissaoLinha>[] = [
    {
      accessorKey: "categoria",
      header: "Módulos",
      cell: (info) => <strong>{info.getValue() as string}</strong>
    },
    {
      accessorKey: "nome",
      header: "Permissão"
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/permissoes/atualizar`,
              { id: row.original.id, status: novoStatus },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            setPermissoes((prev) =>
              prev.map((item) =>
                item.id === row.original.id ? { ...item, status: novoStatus } : item
              )
            );

            toast.success("Status atualizado com sucesso!");
          } catch (error: any) {
            toast.error(`Erro ao atualizar status: ${error.response?.data?.detail || error.message}`);
          }
        };

        return (
          <Badge
            onClick={toggleStatus}
            className={`w-24 cursor-pointer ${ativo ? "" : "border-primary text-primary border bg-transparent"}`}
            variant={ativo ? "default" : "outline"}
          >
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedPermissao(row.original);
          }}
          title="Editar permissão"
        >
          <Pencil />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredPermissoes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase())
  });

  function closeSheet() {
    setSelectedPermissao(null);  // fechar Sheet porque permissao=null fecha o sheet no componente filho
    setRefreshKey((prev) => prev + 1);  // força recarregar lista atualizada
  }

  return (
    <>
      <Card className="col-span-2">
        <CardHeader className="flex justify-between">
          <CardTitle>Lista de permissões</CardTitle>
          <Input
            placeholder="Filtrar por qualquer campo..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {!header.isPlaceholder && (
                          typeof header.column.columnDef.header === "function"
                            ? header.column.columnDef.header(header.getContext() as any)
                            : String(header.column.columnDef.header)
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <CarregandoTable />
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sheet para editar permissões */}
      <EquipeEditForm
        permissoes={selectedPermissao}
        onClose={closeSheet}
      />
    </>
  );
}
