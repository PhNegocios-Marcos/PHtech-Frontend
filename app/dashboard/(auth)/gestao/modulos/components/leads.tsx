"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulosDrawer } from "./modulosModal";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ModuloLinha = {
  id: string;
  nome: string;
  status: number;
};

export function ModulosTable() {
  const { token } = useAuth();
  const [modulos, setModulos] = React.useState<ModuloLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [selectedModulos, setSelectedModulos] = React.useState<ModuloLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");


  React.useEffect(() => {
    async function fetchModulos() {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/modulo/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar módulos");

        const data = await res.json();

        // console.log("Resposta da API:", data);

        const arr: ModuloLinha[] = data.map((m: any) => ({
          id: m.id,
          nome: m.nome,
          status: m.status
        }));

        setModulos(arr);
      } catch (error) {
        console.error("Erro ao carregar módulos:", error);
      }
    }

    fetchModulos();
  }, [token, refreshKey]);

  const filteredModulos = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return modulos.filter((m) => m.nome.toLowerCase().includes(filtroLower));
  }, [filtro, modulos]);

  const columns: ColumnDef<ModuloLinha>[] = [
    {
      accessorKey: "nome",
      header: "Módulo"
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
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar usuário">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredModulos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: {
      globalFilter
    }
  });

  function renderHeader(header: any): React.ReactNode {
    if (typeof header.column.columnDef.header === "function") {
      return (header.column.columnDef.header as (ctx: any) => React.ReactNode)(header.getContext());
    }
    return String(header.column.columnDef.header);
  }

  const handleRowDoubleClick = (modulos: ModuloLinha) => {
    setSelectedModulos(modulos);
  };

  const handleCloseDrawer = () => {
    setSelectedModulos(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Modulos</CardTitle>
      </CardHeader>

      {!selectedModulos ? (
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
                      onDoubleClick={() => handleRowDoubleClick(row.original)}
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
        </CardContent>
      ) : (
        <ModulosDrawer
          isOpen={!!selectedModulos}
          modulos={selectedModulos}
          onClose={() => {
            handleCloseDrawer();
            handleRefresh();
          }}
          onRefresh={handleRefresh}
        />
      )}
    </Card>
  );
}
