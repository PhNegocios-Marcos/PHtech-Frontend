"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./leads_carregando";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { ModalRO } from "./modalRO";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type RoteiroOperacional = {
  rotina_operacional_hash: string;
  nome: string;
  descricao: string;
  idade_minima: number;
  idade_maxima: number;
  prazo_minimo: number;
  prazo_maximo: number;
  valor_bruto_minimo: string;
  valor_bruto_maximo: string;
  usa_margem_seguranca: boolean;
  tarifa_cadastro_minima: string;
  tarifa_cadastro_maxima: string;
  usa_limite_proposta: boolean;
  status: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ro?: RoteiroOperacional;
};

export default function RoteiroOperacionalTable({ ro, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const { token } = useAuth();

  const [roteiros, setRoteiros] = useState<RoteiroOperacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedRO, setSelectedRO] = React.useState<RoteiroOperacional | null>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [refreshKey, setRefreshKey] = React.useState(0);

  useEffect(() => {
    async function fetchRoteiros() {
      try {
        // Chamada para API fake - na prática, substitua por sua chamada real
        const response = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        setRoteiros(response.data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os roteiros operacionais",
          variant: "destructive"
        });
        console.error("Erro ao buscar roteiros:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoteiros();
  }, [toast, token, refreshKey]);

  const columns: ColumnDef<RoteiroOperacional>[] = [
    {
      accessorKey: "nome",
      header: "Nome"
    },
    {
      accessorKey: "descricao",
      header: "Descrição"
    },
    {
      accessorKey: "idade_minima",
      header: "Idade Mínima"
    },
    {
      accessorKey: "idade_maxima",
      header: "Idade Máxima"
    },
    {
      accessorKey: "prazo_minimo",
      header: "Prazo Mínimo"
    },
    {
      accessorKey: "prazo_maximo",
      header: "Prazo Máximo"
    },
    {
      accessorKey: "valor_bruto_minimo",
      header: "Valor Bruto Mín.",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.valor_bruto_minimo).toFixed(2)}</span>
    },
    {
      accessorKey: "valor_bruto_maximo",
      header: "Valor Bruto Máx.",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.valor_bruto_maximo).toFixed(2)}</span>
    },
    {
      accessorKey: "usa_margem_seguranca",
      header: "Usa Margem Segurança",
      cell: ({ row }) => <span>{row.original.usa_margem_seguranca ? "Sim" : "Não"}</span>
    },
    {
      accessorKey: "tac_min",
      header: "TAC Mínima",
      cell: ({ row }) => (
        <span>R$ {parseFloat(row.original.tarifa_cadastro_minima).toFixed(2)}</span>
      )
    },
    {
      accessorKey: "tac_max",
      header: "TAC Máxima",
      cell: ({ row }) => (
        <span>R$ {parseFloat(row.original.tarifa_cadastro_maxima).toFixed(2)}</span>
      )
    },
    {
      accessorKey: "usa_limite_proposta",
      header: "Usa Limite Proposta",
      cell: ({ row }) => <span>{row.original.usa_limite_proposta ? "Sim" : "Não"}</span>
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;
        return (
          <Badge
            className={ativo ? "w-24" : "w-24 border border-red-500 bg-transparent text-red-500"}
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
          onClick={() => setSelectedRO(row.original)}
          title="Editar usuário">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: roteiros,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      {selectedRO ? (
        <ModalRO
          roteiro={selectedRO} // Passe o roteiro selecionado
          onClose={() => setSelectedRO(null)}
          onRefresh={handleRefresh}
        />
      ) : (
        <Card className="col-span-2">
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Roteiro Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <>
              <div className="mb-4 flex items-center gap-2">
                <Input
                  placeholder="Filtrar por qualquer campo..."
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
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
                        {headerGroup.headers.map((header, index) => {
                          const isLast = index === headerGroup.headers.length - 1;
                          return (
                            <TableHead
                              key={header.id}
                              className={`truncate overflow-hidden whitespace-nowrap ${
                                isLast ? "w-16" : "w-auto" // Ajuste para 50px na última coluna
                              }`}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          onDoubleClick={() => setSelectedRO(row.original)}
                          className="hover:bg-muted cursor-pointer">
                          {row.getVisibleCells().map((cell, index) => {
                            const isLast = index === row.getVisibleCells().length - 1;
                            return (
                              <TableCell
                                key={cell.id}
                                className={`truncate overflow-hidden whitespace-nowrap ${
                                  isLast ? "w-16" : "w-auto" // Mesmo ajuste para células
                                }`}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <CarregandoTable />
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
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
            </>
          </CardContent>
        </Card>
      )}
    </>
  );
}
