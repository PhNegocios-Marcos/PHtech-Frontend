// Arquivo: ModulosTable.tsx
"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { CarregandoTable } from "./leads_carregando";
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
import { Search } from "lucide-react";
import { toast } from "sonner";

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
        const arr: ModuloLinha[] = data.map((m: any) => ({
          id: m.id,
          nome: m.nome,
          status: m.status
        }));

        setModulos(arr);
      } catch (error: any) {
        console.error("Erro ao carregar módulos:", error);
        toast.error(`Erro ao carregar módulos: ${error.message || error}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
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

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/modulo/atualizar`,
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

            setModulos((prev) =>
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
    },
    {
      id: "editar",
      header: "Ver",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar usuário">
          <Search className="h-4 w-4" />
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

  const handleRowDoubleClick = (modulos: ModuloLinha) => {
    setSelectedModulos(modulos);
  };

  const handleCloseDrawer = () => {
    setSelectedModulos(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    // toast.success("Tabela de módulos atualizada!", {
    //   style: {
    //     background: 'var(--toast-success)',
    //     color: 'var(--toast-success-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
  };

  return (
    <>
      <Card className="col-span-2">
        <CardHeader className="flex flex-col justify-between">
          <CardTitle>Módulos</CardTitle>
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
                      onDoubleClick={() => handleRowDoubleClick(row.original)}
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
        </CardContent>
      </Card>
      <ModulosDrawer
        isOpen={!!selectedModulos}
        modulos={selectedModulos}
        onClose={() => {
          handleCloseDrawer();
          handleRefresh();
        }}
        onRefresh={handleRefresh}
      />
    </>
  );
}
