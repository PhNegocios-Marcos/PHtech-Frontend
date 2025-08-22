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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
import { PromotoraDrawer, Promotora } from "./PromotoraModal";

type PromotorasTableProps = {
  onSelectPromotora: (promotora: Promotora) => void;
};

// Função de máscara de CNPJ
function formatCNPJ(value: any) {
  if (!value) return "";
  const str = String(value).replace(/\D/g, "");
  return str
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

export function PromotorasTable({ onSelectPromotora }: PromotorasTableProps) {
  const [promotoras, setPromotoras] = React.useState<Promotora[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedPromotora, setSelectedPromotora] = React.useState<Promotora | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<Promotora | null>(null);

  const { token } = useAuth();

  const promotoraColumns: ColumnDef<Promotora>[] = [
    { accessorKey: "nome", header: "Nome" },
    { accessorKey: "razao_social", header: "Razão Social" },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ getValue }) => formatCNPJ(getValue())
    },
    { accessorKey: "representante", header: "Representante" },
    { accessorKey: "master", header: "É Master?" },
    {
      accessorKey: "rateio_master",
      header: "Rateio Master",
      cell: ({ getValue }) => {
        const valor = getValue<number>();
        return `${Math.round(valor)}%`;
      }
    },
    {
      accessorKey: "rateio_sub",
      header: "Rateio Sub",
      cell: ({ getValue }) => {
        const valor = getValue<number>();
        return `${Math.round(valor)}%`;
      }
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
          onClick={() => handleRowClick(row.original)}
          title="Editar usuário">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  React.useEffect(() => {
    async function fetchPromotoras() {
      try {
        const response = await fetch(`${API_BASE_URL}/promotora/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar promotoras");
        }

        const data = await response.json();
        const promotorasArray = data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          razao_social: item.razao_social,
          cnpj: item.cnpj,
          representante: item.representante,
          master: item.master,
          master_id: item.master_id,
          rateio_master: item.rateio_master,
          rateio_sub: item.rateio_sub,
          status: item.status
        }));

        setPromotoras(promotorasArray);
      } catch (error: any) {
        console.error("Erro ao buscar promotoras:", error.message || error);
        toast.error("Erro ao carregar lista de promotoras", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: error.message || "Tente novamente mais tarde"
        });
      }
    }

    if (token) {
      fetchPromotoras();
    } else {
      toast.error("Autenticação necessária", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        },
        description: "Faça login para acessar esta página"
      });
    }
  }, [token]);

  const table = useReactTable({
    data: promotoras,
    columns: promotoraColumns,
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

  const handleRowClick = (promotora: Promotora) => {
    try {
      onSelectPromotora(promotora);
      toast.success("Promotora selecionada", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        },
        description: `Editando: ${promotora.nome}`
      });
    } catch (error: any) {
      toast.error("Erro ao selecionar promotora", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        },
        description: error.message || "Tente novamente"
      });
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Promotoras</CardTitle>
      </CardHeader>
      <CardContent>
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
                    onDoubleClick={() => handleRowClick(row.original)}
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

        <PromotoraDrawer
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          promotora={selectedPromotora as any}
        />
      </CardContent>
    </Card>
  );
}
