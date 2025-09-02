"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./leads_carregando";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export type Produto = {
  id: string;
  nome: string;
  status: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  config_tabela_hash: string;
  usuario_atualizacao: string;
  data_inclusao: string;
  data_atualizacao: string;
};

// New type for the API response
type ApiProdutoResponse = {
  [key: string]: {
    nome: string;
    status: number;
    data_inclusao: string;
    data_atualizacao: string;
    cadastros: any[];
    tradutores: Array<{ [key: string]: any }>;
    credenciais: any[];
  };
};

const formatarData = (dataString: string | null | undefined) => {
  if (!dataString) return "-";

  try {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat("pt-BR").format(data);
  } catch (error) {
    return dataString;
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ProdutosTableProps = {
  onSelectProduto: (produto: Produto) => void;
};

export function ProdutosTable({ onSelectProduto }: ProdutosTableProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  const columns: ColumnDef<Produto>[] = [
    { accessorKey: "nome", header: "Nome" },
    {
      accessorKey: "data_inclusao",
      header: "Data de Inclusão",
      accessorFn: (row) => (row.data_inclusao ? new Date(row.data_inclusao).getTime() : null),
      cell: ({ row }) => formatarData(row.original.data_inclusao)
    },
    {
      accessorKey: "data_atualizacao",
      header: "Data de Atualização",
      accessorFn: (row) => (row.data_atualizacao ? new Date(row.data_atualizacao).getTime() : null),
      cell: ({ row }) => formatarData(row.original.data_atualizacao)
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/bancarizador/atualizar`,
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

            // 🔥 Atualiza diretamente no estado produtos
            setProdutos((prev) =>
              prev.map((item) =>
                item.id === row.original.id ? { ...item, status: novoStatus } : item
              )
            );

            toast.success(`Status atualizado para ${novoStatus === 1 ? "Ativo" : "Inativo"}`, {
              style: {
                background: "var(--toast-success)",
                color: "var(--toast-success-foreground)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          } catch (error: any) {
            console.error("Erro ao atualizar status", error);
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
            className={`w-24 cursor-pointer ${
              ativo ? "" : "border border-red-500 bg-transparent text-red-500"
            }`}
            variant={ativo ? "default" : "outline"}>
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
          onClick={() => onSelectProduto(row.original)}
          title="Editar produto">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  useEffect(() => {
    async function fetchProdutos() {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/bancarizador/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar produtos");
        }

        const data: ApiProdutoResponse[] = await response.json();

        // Transform the API response into the expected Produto format
        const transformedData: Produto[] = data.flatMap((item) =>
          Object.entries(item).map(([id, produtoData]) => ({
            id,
            nome: produtoData.nome,
            status: produtoData.status,
            id_uy3: null,
            cor_grafico: null,
            config_tabela_hash: "",
            usuario_atualizacao: produtoData.data_atualizacao,
            tabela_hash: "",
            data_inclusao: produtoData.data_inclusao,
            data_atualizacao: produtoData.data_atualizacao,
            idade_minima: "",
            idade_maxima: "",
            prazo_minimo: "",
            prazo_maximo: ""
          }))
        );

        setProdutos(transformedData);
      } catch (error: any) {
        console.error("Erro na requisição:", error.message || error);
        toast.error("Erro ao carregar produtos", {
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

    fetchProdutos();
  }, [token]);

  const table = useReactTable({
    data: produtos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Modalidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("nome")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Colunas <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                <CarregandoTable />
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted cursor-pointer">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 pt-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
