"use client";

import React, { useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { Pencil, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import axios from "axios";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import toastComponent from "@/utils/toastComponent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Usuario = {
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

// Função para formatar telefone
function formatTelefone(telefone: string): string {
  if (!telefone) return "";

  // Remove tudo que não for número
  let digits = telefone.replace(/\D/g, "");

  // Remove o código do Brasil se tiver
  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  // Aplica máscara
  if (digits.length <= 10) {
    // Telefone fixo (xx) xxxx-xxxx
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  } else {
    // Celular (xx) xxxxx-xxxx
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
}

// Função para formatar CPF
function formatCpf(cpf: string): string {
  if (!cpf) return "";

  // Remove tudo que não for número
  let digits = cpf.replace(/\D/g, "");

  // Aplica máscara
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function UsuariosTable() {
  const podeCriar = useHasPermission("Usuarios_atualizar");

  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const { token } = useAuth();

  const usuarioColumns = React.useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: "nome", header: "Nome" },
      {
        accessorKey: "cpf",
        header: "CPF",
        cell: ({ getValue }) => formatCpf(String(getValue()))
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "telefone",
        header: "Telefone",
        cell: ({ getValue }) => formatTelefone(String(getValue()))
      },
      { accessorKey: "endereco", header: "Endereço" },
      { accessorKey: "tipo_acesso", header: "Tipo de Usuário" },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const ativo = row.original.status === 1;

          const toggleStatus = async () => {
            try {
              const novoStatus = ativo ? 0 : 1;

              await axios.put(
                `${API_BASE_URL}/usuario/atualizar`,
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

              setUsuarios((prev) =>
                prev.map((item) =>
                  item.id === row.original.id ? { ...item, status: novoStatus } : item
                )
              );

              toastComponent.success("Status atualizado com sucesso!");
            } catch (error: any) {
              toastComponent.error(`Erro ao atualizar status: ${error.response?.data?.detail || error.message}`);
            }
          };

          return (
            <>
              {podeCriar ? (
                <Badge
                  onClick={toggleStatus}
                  className={`w-24 cursor-pointer ${ativo ? "" : "border-primary border bg-transparent text-primary"}`}
                  variant={ativo ? "default" : "outline"}>
                  {ativo ? "Ativo" : "Inativo"}
                </Badge>
              ) : (
                <Badge
                  className={`w-24 cursor-pointer ${ativo ? "" : "border-primary border bg-transparent text-primary"}`}
                  variant={ativo ? "default" : "outline"}>
                  {ativo ? "Ativo" : "Inativo"}
                </Badge>
              )}
            </>
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
            onClick={() => setSelectedUser(row.original)}
            title="Editar usuário">
            <Search className="h-4 w-4" />
          </Button>
        ),
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

   useEffect(() => {
      const timeout = setTimeout(() => {
        if (!token) {
          toastComponent.error("Token de autenticação não encontrado");
          sessionStorage.clear();
          router.push("/dashboard/login");
        } 
      }, 2000);
 
     return () => clearTimeout(timeout);
   }, [token, router]);

  React.useEffect(() => {
    async function fetchUsuarios() {
      setIsLoading(true);
      try {
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

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
        toastComponent.error(`Erro ao carregar usuários: ${error.message}`);
      } finally {
        setIsLoading(false);
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
    <>
      {selectedUser ? (
        <UsuarioPerfil
          usuario={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefresh={handleRefresh}
        />
      ) : (
        <Card className="col-span-2">
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <>
              <div className="mb-4 flex items-center">
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
                    {isLoading ? (
                      <CarregandoTable />
                    ) : table.getRowModel().rows.length ? (
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
                      <TableRow>
                        <TableCell colSpan={usuarioColumns.length} className="h-24 text-center">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
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
