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
  VisibilityState,
  Row
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
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./leads_carregando";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Usuario = {
  id: string;
  permissao: string;
  status: number; // 0 ou 1
};

type UsuariosTableProps = {
  equipeNome: string;
};

export function UsuariosPorEquipeTable({ equipeNome }: UsuariosTableProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [equipeLabel, setEquipeLabel] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { token } = useAuth();

  const atualizarStatusPermissao = async (id: string, novoStatus: 0 | 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rel_permissao_perfil/atualizar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: novoStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Erro ao atualizar permissão");
      }

      setUsuarios((prev) =>
        prev.map((usuario) => (usuario.id === id ? { ...usuario, status: novoStatus } : usuario))
      );
    } catch (error: any) {
      console.error("Erro ao atualizar permissão:", error.message || error);
    }
  };

  const columns: ColumnDef<Usuario>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={table.getIsAllPageRowsSelected()}
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Selecionar todos"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Selecionar linha"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false
    // },
    {
      accessorKey: "permissao",
      header: "Permissão"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (getValue() === 1 ? "Ativo" : "Inativo")
    },
    {
      id: "acoes",
      header: "Ações",
      cell: ({ row }) => {
        const { id, status } = row.original;
        const novoStatus = status === 1 ? 0 : 1;
        return (
          <Button
            className={
              status === 1
                ? "flex justify-center border-2 border-solid border-red-600 bg-white text-red-600 hover:bg-red-100"
                : "bg-red-600 text-white hover:bg-red-700"
            }
            onClick={() => atualizarStatusPermissao(id, novoStatus)}>
            {status === 1 ? "Desativar" : "Ativar"}
          </Button>
        );
      }
    }
  ];

  useEffect(() => {
    async function fetchUsuariosDaEquipe() {
      if (!token || !equipeNome) return;

      try {
        const response = await fetch(`${API_BASE_URL}/rel_permissao_perfil/${equipeNome}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar permissões da equipe");
        }

        const data = await response.json();
        setEquipeLabel(data.perfil ?? equipeNome);

        const permissoes = data.permissões || {};
        const usuariosFormatados: Usuario[] = Object.entries(permissoes).map(
          ([id, obj]: [string, any]) => ({
            id,
            permissao: obj.permissao_nome,
            status: obj.permissao_status
          })
        );

        setUsuarios(usuariosFormatados);
      } catch (error: any) {
        console.error("Erro ao buscar usuários:", error.message || error);
      }
    }

    fetchUsuariosDaEquipe();
  }, [token, equipeNome]);

  async function handleDesativarSelecionadas() {
    const selectedRows = table.getSelectedRowModel().rows as Row<Usuario>[];
    for (const row of selectedRows) {
      const { id, status } = row.original;
      if (status === 1) {
        await atualizarStatusPermissao(id, 0);
      }
    }
  }

  const table = useReactTable({
    data: usuarios,
    columns,
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
        <CardTitle>Permissões do Perfil: {equipeLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("permissao")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("permissao")?.setFilterValue(event.target.value)}
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

        {/* <div className="mb-4">
          <Button onClick={handleDesativarSelecionadas} variant="destructive">
            Desativar Selecionadas
          </Button>
        </div> */}

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
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted">
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={index === 2 ? "" : ""}>
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
