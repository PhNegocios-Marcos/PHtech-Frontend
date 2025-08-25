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
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AlcadaEdit } from "./alcada-edit";

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
  const [selectedAlcada, setSelectedAlcada] = React.useState<AlcadaLinha | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const fetchAlcadas = React.useCallback(async () => {
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
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchAlcadas();
  }, [fetchAlcadas]);

  const handleEditAlcada = (alcada: AlcadaLinha) => {
    setSelectedAlcada(alcada);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedAlcada(null);
  };

  const handleRefresh = () => {
    // Recarregar os dados após edição
    fetchAlcadas();
  };

  const columns: ColumnDef<AlcadaLinha>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ getValue }) => `R$ ${getValue<number>().toLocaleString('pt-BR')}`
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ getValue }) => {
        const desc = getValue<string>();
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
      }
    },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const status = row.original.status ?? 1;
    //     return (
    //       <Badge
    //         variant={status === 1 ? "default" : "outline"}
    //         className={status === 0 ? "border-red-500 text-red-500" : ""}
    //       >
    //         {status === 1 ? "Ativo" : "Inativo"}
    //       </Badge>
    //     );
    //   }
    // },
    {
      id: "editar",
      header: "Ações",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditAlcada(row.original)}
          title="Editar alçada"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
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
    <div className="space-y-4">
      {isEditOpen && selectedAlcada && (
        <AlcadaEdit
          alcada={selectedAlcada}
          onClose={handleCloseEdit}
          onRefresh={handleRefresh}
        />
      )}

      {!isEditOpen && (
        <>
          <div className="flex items-center justify-between">
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma alçada encontrada
                    </TableCell>
                  </TableRow>
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
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}