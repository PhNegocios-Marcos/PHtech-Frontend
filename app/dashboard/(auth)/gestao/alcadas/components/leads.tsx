"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";
import { CarregandoTable } from "./leads_carregando";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type AlcadaLinha = {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  status?: number;
};

export function AlcadasTable() {
  const { token } = useAuth();
  const [alcadas, setAlcadas] = React.useState<AlcadaLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAlcadas() {
      if (!token) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/alcada/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Erro ao buscar alçadas");
        }

        const data = await res.json();
        const arr: AlcadaLinha[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          descricao: a.descricao,
          valor: a.valor,
          status: a.status
        }));

        setAlcadas(arr);
      } catch (error: any) {
        console.error("Erro ao carregar alçadas:", error);
        toast.error("Falha ao carregar alçadas", {
          description: error.message || "Tente novamente mais tarde",
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAlcadas();
  }, [token]);

  const columns: ColumnDef<AlcadaLinha>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ getValue }) => `${getValue<number>().toLocaleString("pt-BR")}`
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ getValue }) => {
        const desc = getValue<string>();
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
      }
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
              `${API_BASE_URL}/alcada/atualizar`,
              {
                id: row.original.id,
                status: novoStatus
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setAlcadas((prev) =>
              prev.map((item) =>
                item.id === row.original.id ? { ...item, status: novoStatus } : item
              )
            );

            toast.success("Status atualizado com sucesso!", {
              style: {
                background: "var(--toast-success)",
                color: "var(--toast-success-foreground)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          } catch (error: any) {
            toast.error(
              `Erro ao atualizar status: ${error.response?.data?.detail || error.message}`,
              {
                style: {
                  background: "var(--toast-error)",
                  color: "var(--toast-error-foreground)",
                  boxShadow: "var(--toast-shadow)"
                }
              }
            );
          }
        };

        return (
          <Badge
            onClick={toggleStatus}
            className={`w-24 cursor-pointer ${ativo ? "" : "border-primary text-primary border bg-transparent"}`}
            variant={ativo ? "default" : "outline"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    }
  ];

  const table = useReactTable({
    data: alcadas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: filtro
    },
    onGlobalFilterChange: setFiltro
  });

  return (
    <Card className="col-span-2 space-y-4">
      <CardHeader>
        <CardTitle>Alçada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Filtrar alçadas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <CarregandoTable />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <CarregandoTable />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && (
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
