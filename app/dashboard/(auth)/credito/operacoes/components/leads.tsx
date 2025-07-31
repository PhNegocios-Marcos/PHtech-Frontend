"use client";

import React from "react";
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
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { Pencil } from "lucide-react";

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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { CarregandoTable } from "./leads_carregando";
import OperacoesDrawer from "./operacoesModal";

// Function to format any number or string into Brazilian Reais (BRL)
const formatToBRL = (value: number | string | null | undefined): string => {
  if (value == null) {
    return "R$ 0,00";
  }
  let cleanedValue = String(value).replace(/[^\d.,-]/g, "");
  cleanedValue = cleanedValue.replace(",", ".");
  const numericValue = parseFloat(cleanedValue.replace(/\.+/g, ".")) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

// Function to format date from YYYY-MM-DD HH:MM:SS to DD/MM/YYYY HH:MM:SS
const formatToBrazilianDate = (date: string | null | undefined): string => {
  if (!date) {
    return "N/A";
  }
  try {
    const dateTime = new Date(date);
    if (isNaN(dateTime.getTime())) {
      return "Data inválida";
    }
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(dateTime);
  } catch {
    return "Data inválida";
  }
};

// Function to format CPF or CNPJ based on length
const formatCpfOrCnpj = (value: string | null | undefined): string => {
  if (!value) {
    return "N/A";
  }
  const cleanedValue = value.replace(/\D/g, ""); // Remove non-digits
  if (cleanedValue.length === 11) {
    // CPF: 123.456.789-01
    return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (cleanedValue.length === 14) {
    // CNPJ: 12.345.678/0001-90
    return cleanedValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return cleanedValue; // Return unformatted if not CPF or CNPJ
};

type Proposta = {
  id: string;
  Correspondente: string;
  Operação: string;
  Produto: string;
  Tomador: string;
  CPF: string;
  Valor: string;
  Data: string;
  status: number;
  roteiro: string;
  Tabela: string;
};

export function OperacoesTable() {
  const [equipes, setEquipes] = React.useState<Proposta[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Proposta | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const { token } = useAuth();

  const equipeColumns: ColumnDef<Proposta>[] = [
    { accessorKey: "Correspondente", header: "Correspondente" },
    { accessorKey: "Operação", header: "Operação" },
    { accessorKey: "Produto", header: "Produto" },
    { accessorKey: "Tomador", header: "Tomador" },
    {
      accessorKey: "CPF",
      header: "CPF/CNPJ",
      cell: ({ row }) => <span>{formatCpfOrCnpj(row.original.CPF)}</span>,
    },
    {
      accessorKey: "Valor",
      header: "Valor principal",
      cell: ({ row }) => <span>{formatToBRL(row.original.Valor)}</span>,
    },
    {
      accessorKey: "Data",
      header: "Data de início",
      cell: ({ row }) => <span>{formatToBrazilianDate(row.original.Data)}</span>,
    },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "roteiro", header: "Status do roteiro de liquidação" },
    // { accessorKey: "Tabela", header: "Tabela" },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedUser(row.original)}
          title="Editar usuário">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  React.useEffect(() => {
    async function fetchEquipes() {
      try {
        const response = await fetch(`${API_BASE_URL}/proposta/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar equipes");
        }

        const data = await response.json();

        const operacoesArray = data.map((proposta: any) => ({
          id: proposta.id,
          Correspondente: proposta.Correspondente,
          Operação: proposta.produto,
          Produto: proposta.produto,
          Tomador: proposta.tomador,
          CPF: proposta.cpf,
          Valor: proposta.valor,
          Data: proposta.data,
          status: proposta.status,
          roteiro: proposta.roteiro,
          Tabela: proposta.Tabela
        }));

        setEquipes(operacoesArray);
      } catch (error: any) {
        console.error("Erro ao buscar equipes:", error.message || error);
      }
    }

    fetchEquipes();
  }, [token]);

  const table = useReactTable({
    data: equipes,
    columns: equipeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      // Adjust global filter to handle formatted values
      const value = columnId === "CPF" ? formatCpfOrCnpj(row.getValue(columnId)) :
                    columnId === "Valor" ? formatToBRL(row.getValue(columnId)) :
                    columnId === "Data" ? formatToBrazilianDate(row.getValue(columnId)) :
                    String(row.getValue(columnId));
      return value.toLowerCase().includes(String(filterValue).toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  });

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Operações</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          <OperacoesDrawer
            isOpen={true}
            onClose={() => setSelectedUser(null)}
            Proposta={selectedUser}
          />
        ) : (
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
                              isLast ? "w-16" : "w-auto"
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
                        onDoubleClick={() => setSelectedUser(row.original)}
                        className="hover:bg-muted cursor-pointer">
                        {row.getVisibleCells().map((cell, index) => {
                          const isLast = index === row.getVisibleCells().length - 1;
                          return (
                            <TableCell
                              key={cell.id}
                              className={`truncate overflow-hidden whitespace-nowrap ${
                                isLast ? "w-16" : "w-auto"
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
        )}
      </CardContent>
    </Card>
  );
}