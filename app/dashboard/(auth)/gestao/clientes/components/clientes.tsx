"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./tabela_carregando";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { ModalCliente } from "./ClienteModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Cliente = {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  status: number;
  data_cadastro: string;
  data_atualizacao: string;
};

export default function ListaClientes() {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<Cliente>[] = [
    { accessorKey: "cpf", header: "CPF" },
    { accessorKey: "nome", header: "Nome" },
    { accessorKey: "email", header: "E-mail" },
    { accessorKey: "telefone", header: "Telefone" },
    { 
      accessorKey: "data_nascimento", 
      header: "Data Nascimento",
      cell: ({ row }) => {
        return new Date(row.original.data_nascimento).toLocaleDateString();
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
              `${API_BASE_URL}/cliente/atualizar`,
              {
                cpf: row.original.cpf,
                status: novoStatus
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setClientes(prev =>
              prev.map(item =>
                item.cpf === row.original.cpf ? { ...item, status: novoStatus } : item
              )
            );

            toast.success(`Status atualizado para ${novoStatus === 1 ? "Ativo" : "Inativo"}`);
          } catch (error: any) {
            console.error("Erro ao atualizar status", error);
            toast.error(`Erro ao atualizar status: ${error.response?.data?.detail || error.message}`);
          }
        };

        return (
          <Badge
            onClick={toggleStatus}
            className={`w-24 cursor-pointer ${ativo ? "" : "border border-red-500 bg-transparent text-red-500"}`}
            variant={ativo ? "default" : "outline"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    },
    {
      id: "editar",
      header: "Ações",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedCliente(row.original)}
          title="Editar cliente">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/cliente`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setClientes(res.data);
      } catch (error: any) {
        console.error("Erro ao carregar clientes", error);
        toast.error(`Erro ao carregar clientes: ${error.response?.data?.detail || error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, [token]);

  const table = useReactTable({
    data: clientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  });

  return (
    <div className="space-y-6">
      {selectedCliente ? (
        <ModalCliente
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
          onRefresh={() => {
            setSelectedCliente(null);
            // Aqui você pode adicionar lógica para recarregar os clientes
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Filtrar clientes..."
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
                {table.getFilteredRowModel().rows.length} cliente(s) selecionado(s).
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
      )}
    </div>
  );
}