"use client";

import React from "react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { UsuarioDrawer } from "./PromotoraModal";
import { CarregandoTable } from "./leads_carregando";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // se for Next.js

type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereco: string;
  status: number;
};

const usuarioColumns: ColumnDef<Usuario>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "cpf", header: "CPF" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "telefone", header: "Telefone" },
  { accessorKey: "endereco", header: "Endereço" },
  { accessorKey: "tipo_acesso", header: "Tipo de Acesso" },
  { accessorKey: "status", header: "Status" }
];

export function UsuariosTable() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { token } = useAuth();
  // console.log(token)
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
        const usuariosObject = data.usuarios;

        const usuariosArray = Object.entries(usuariosObject).map(
          ([id, usuario]: [string, any]) => ({
            id,
            nome: usuario.nome,
            cpf: usuario.cpf,
            email: usuario.email,
            tipo_acesso: usuario.tipo_acesso,
            telefone: usuario.telefone,
            endereco: usuario["endereço"],
            status: usuario.status
          })
        );

        setUsuarios(usuariosArray);
      } catch (error: any) {
        window.location.href = "/dashboard/login"; // Corrigido: "dashboar" → "dashboard"
        // console.error("Erro na requisição:", error.message || error);
      }
    }

    fetchUsuarios();
  }, [token]);

  const table = useReactTable({
    data: usuarios,
    columns: usuarioColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  const handleRowClick = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("nome")?.setFilterValue(event.target.value)}
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
                  <TableRow
                    key={row.id}
                    onDoubleClick={() => handleRowClick(row.original)}
                    className="hover:bg-muted cursor-pointer">
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

        {/* Modal separado */}
        <UsuarioDrawer
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          usuario={selectedUser}
        />
      </CardContent>
    </Card>
  );
}
