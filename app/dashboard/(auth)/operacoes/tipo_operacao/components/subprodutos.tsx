"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import ProdutoDetalhesTabs from "./editSubproduto";
import { toast } from "sonner"; // ✅ adicionado

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Subproduto = {
  produtos_subprodutos_id: string;
  produtos_subprodutos_nome: string;
  produtos_subprodutos_atividade: string;
  produtos_subprodutos_status: number;
  status: number;
};

export function SubprodutosTable() {
  const [subprodutos, setSubprodutos] = useState<Subproduto[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedSubproduto, setSelectedSubproduto] = useState<Subproduto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { token } = useAuth();
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<Subproduto>[] = [
    { accessorKey: "produtos_subprodutos_nome", header: "Nome" },
    { accessorKey: "produtos_subprodutos_atividade", header: "Atividade" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.produtos_subprodutos_status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/subprodutos/atualizar`,
              {
                id: row.original.produtos_subprodutos_id,
                status: novoStatus
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setSubprodutos((prev) =>
              prev.map((item) =>
                item.produtos_subprodutos_id === row.original.produtos_subprodutos_id ? { ...item, produtos_subprodutos_status: novoStatus } : item
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
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedSubproduto(row.original)}
          title="Editar subproduto">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  useEffect(() => {
    async function fetchSubprodutos() {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/subprodutos/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar subprodutos");
        }

        const data = await response.json();
        setSubprodutos(data);
      } catch (error: any) {
        console.error("Erro na requisição:", error.message || error);
        toast.error(`Erro ao buscar subprodutos: ${error.message || error}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }

    fetchSubprodutos();
  }, [token, refreshKey]);

  const table = useReactTable({
    data: subprodutos,
    columns,
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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      {selectedSubproduto ? (
        <>
          <ProdutoDetalhesTabs
            subproduto={selectedSubproduto}
            onClose={() => setSelectedSubproduto(null)}
            onRefresh={handleRefresh}
          />
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Tipo de Operação</CardTitle>
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
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.length ? (
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
                        <CarregandoTable />
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
              </>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Tipo de Operação</CardTitle>
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
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
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
                      <CarregandoTable />
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
            </>
          </CardContent>
        </Card>
      )}
    </>
  );
}
