"use client";

import React, { useEffect, useState } from "react";
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
import { CarregandoTable } from "./leads_carregando";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Promotora = {
  id: string;
  nome: string;
  usuario: {
    id: string;
    nome: string;
  };
  status_relacionamento: number;
};

type UsuariosTableProps = {
  equipeNome: string; // Mantido como estava, apenas mudando o prop para receber o nome da equipe
};

const promotoraColumns: ColumnDef<Promotora>[] = [
  {
    accessorKey: "usuario.nome",
    header: "Nome do Usuário",
    cell: ({ row }) => row.original.usuario.nome
  },
  {
    accessorKey: "status_relacionamento",
    header: "Status",
    cell: ({ getValue }) => (getValue<number>() === 1 ? "Ativo" : "Inativo")
  }
];

export function UsuariosPorEquipeTable({ equipeNome }: UsuariosTableProps) {
  const [promotoras, setPromotoras] = useState<Promotora[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { token } = useAuth();

  // console.log(equipeNome)

  useEffect(() => {
    async function fetchPromotorasRelacionadas() {
      if (!token || !equipeNome) return;

      try {
        const response = await fetch(`${API_BASE_URL}/rel_usuario_equipe/${equipeNome}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar usuários da equipe");
        }

        const data = await response.json();
        // Adaptação para manter a estrutura esperada
        const usuariosFormatados = data.usuarios
          .map((usuario: any) => ({
            id: usuario.id_relacionamento,
            nome: usuario.usuario.nome,
            usuario: {
              id: usuario.usuario.id,
              nome: usuario.usuario.nome
            },
            status_relacionamento: usuario.status_relacionamento
          }))
          .filter((usuario: any) => usuario.status_relacionamento === 1); // <- aqui filtra

        setPromotoras(usuariosFormatados);
      } catch (error: any) {
        console.error("Erro na requisição:", error.message || error);
      }
    }

    fetchPromotorasRelacionadas();
  }, [token, equipeNome]);

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Usuários da Equipe {equipeNome}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("usuario.nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("usuario.nome")?.setFilterValue(event.target.value)
            }
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
