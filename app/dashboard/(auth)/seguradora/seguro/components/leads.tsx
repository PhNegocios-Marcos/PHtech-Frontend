"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { SeguroCarregando } from "./leads_carregando";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SeguroModal } from "./SeguroModal";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type SeguroLinha = {
  id: string;
  nome: string;
  faixa_inicio: string;
  faixa_fim: string;
  valor_seguradora: string;
  valor_pago_cliente: string;
};

export function SeguroTable() {
  const { token } = useAuth();
  const [seguros, setSeguros] = useState<SeguroLinha[]>([]);
  const [filtro, setFiltro] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedSeguro, setSelectedSeguro] = useState<SeguroLinha | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchSeguros() {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/seguro-faixas/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar faixas de seguro");

        const data = await res.json();
        setSeguros(data);
      } catch (error: any) {
        console.error("Erro ao carregar faixas de seguro:", error);
        toast.error(`Erro ao carregar faixas: ${error.message || error}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }

    fetchSeguros();
  }, [token, refreshKey]);

  const filteredSeguros = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return seguros.filter((s) =>
      [s.nome, s.faixa_inicio, s.faixa_fim].some((campo) =>
        (campo || "").toLowerCase().includes(filtroLower)
      )
    );
  }, [filtro, seguros]);

  const columns: ColumnDef<SeguroLinha>[] = [
    {
      accessorKey: "nome",
      header: "Seguradora",
      cell: (info) => <strong>{info.getValue() as string}</strong>
    },
    {
      accessorKey: "faixa_inicio",
      header: "Faixa Inicial"
    },
    {
      accessorKey: "faixa_fim",
      header: "Faixa Final"
    },
    {
      accessorKey: "valor_seguradora",
      header: "Valor Seguradora"
    },
    {
      accessorKey: "valor_pago_cliente",
      header: "Valor Pago Cliente"
    },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar faixa de seguro">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredSeguros,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: { globalFilter }
  });

  const handleRowDoubleClick = (seguro: SeguroLinha) => {
    setSelectedSeguro(seguro);
  };

  const handleCloseDrawer = () => {
    setSelectedSeguro(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Card className="col-span-2">
        <CardHeader className="flex flex-col justify-between">
          <CardTitle>Faixas de Seguro</CardTitle>
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
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {!header.isPlaceholder &&
                          (typeof header.column.columnDef.header === "function"
                            ? header.column.columnDef.header(header.getContext() as any)
                            : String(header.column.columnDef.header))}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 text-center">
                      <SeguroCarregando />
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
        </CardContent>
      </Card>
      <SeguroModal
        isOpen={!!selectedSeguro}
        seguro={selectedSeguro}
        onClose={() => {
          handleCloseDrawer();
          handleRefresh();
        }}
        onRefresh={handleRefresh}
      />
    </>
  );
}
