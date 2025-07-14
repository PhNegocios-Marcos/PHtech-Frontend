"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";
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
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
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
import { UsuarioPerfil } from "./UsuarioModal";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereco: string;
  status: number;
  cnpj: string;
};

export function UsuariosTable() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const { token } = useAuth();

  const usuarioColumns = React.useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: "nome", header: "Nome" },
      { accessorKey: "cpf", header: "CPF" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "telefone", header: "Telefone" },
      { accessorKey: "endereco", header: "Endereço" },
      { accessorKey: "tipo_acesso", header: "Tipo de Usuário" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (getValue<number>() === 1 ? "Ativo" : "Inativo")
      },
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
    ],
    []
  );

  React.useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch(`${API_BASE_URL}/usuario/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar usuários");
        }

        const data = await response.json();
        setUsuarios(
          data.map((usuario: any) => ({
            id: usuario.id,
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email,
            tipo_acesso: usuario.tipo_usuario,
            telefone: usuario.telefone,
            endereco: usuario.endereco,
            status: usuario.status,
            cnpj: usuario.cnpj || ""
          }))
        );
      } catch (error: any) {
        console.error("Erro ao buscar usuários:", error.message);
      }
    }

    fetchUsuarios();
  }, [token, refreshKey]);

  const table = useReactTable({
    data: usuarios,
    columns: usuarioColumns,
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
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          <UsuarioPerfil
            usuario={selectedUser}
            onClose={() => setSelectedUser(null)}
            onRefresh={handleRefresh}
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
              <Table className="w-full table-fixed">
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
                        onDoubleClick={() => setSelectedUser(row.original)}
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
        )}
      </CardContent>
    </Card>
  );
}
