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

// Componentes
import { CarregandoTable } from "./leads_carregando";

// Tipagem
type Usuario = {
  id: string;
  nome: string;
  status: number; // 1 = ativo, 0 = inativo
};

// Dados fictícios (mock) que simulam a resposta do endpoint
const mockApiResponse = {
  usuarios: {
    "1": { nome: "Goku", status: 1 },
    "2": { nome: "Vegeta", status: 1 },
    "3": { nome: "Gohan", status: 0 },
    "4": { nome: "Trunks", status: 1 },
    "5": { nome: "Freeza", status: 0 }
  }
};

export function UsuariosTable() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    async function fetchUsuarios() {
      try {
        // Simulação de requisição com delay
        // const response = await fetch("/sua-api/usuario/listar", {
        //   headers: { Authorization: "Bearer SEU_TOKEN" }
        // });
        // const data = await response.json();

        const data = mockApiResponse; // usa dados falsos
        const usuariosObject = data.usuarios;

        const usuariosArray = Object.entries(usuariosObject).map(
          ([id, usuario]: [string, any]) => ({
            id,
            nome: usuario.nome,
            status: usuario.status
          })
        );

        setUsuarios(usuariosArray);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }

    fetchUsuarios();
  }, []);

  // Alterna status ativo/inativo
  const toggleStatus = (id: string) => {
    setUsuarios((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status: user.status === 1 ? 0 : 1 } : user))
    );
  };

  // Colunas da tabela
  const usuarioColumns: ColumnDef<Usuario>[] = [
    { accessorKey: "nome", header: "Nome" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const usuario = row.original;
        const isAtivo = usuario.status === 1;
        return (
          <Button
            onClick={() => toggleStatus(usuario.id)}
            className={
              isAtivo
                ? "bg-primary hover:bg-primary/50 px-3 py-1 text-xs text-white hover:text-white"
                : "border-primary text-primary hover:text-primary hover:bg-primary/30 border bg-transparent px-3 py-1 text-xs"
            }
            variant="ghost">
            {isAtivo ? "Ativo" : "Inativo"}
          </Button>
        );
      }
    }
  ];

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

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Permissões</CardTitle>
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
      </CardContent>
    </Card>
  );
}
