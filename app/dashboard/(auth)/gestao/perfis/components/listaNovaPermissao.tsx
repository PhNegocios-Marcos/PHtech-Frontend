"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./leads_carregando";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Permissao = {
  id: string;
  nome: string;
  status: number;
  categoria: string;
};

type UsuariosTableProps = {
  equipeNome: string;
  perfilId: string;
};

export function Permissoes({ equipeNome, perfilId }: UsuariosTableProps) {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<Set<string>>(new Set());
  const [equipeLabel, setEquipeLabel] = useState<string>(equipeNome);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchPermissoes() {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/permissoes/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const permissoesFormatadas: Permissao[] = [];

        for (const categoria in data) {
          if (Array.isArray(data[categoria])) {
            data[categoria].forEach((item: any) => {
              permissoesFormatadas.push({
                id: item.id,
                nome: item.nome,
                status: item.status,
                categoria,
              });
            });
          }
        }

        setPermissoes(permissoesFormatadas);
      } catch (error: any) {
        console.error("Erro ao buscar permissões:", error.message || error);
      }
    }

    fetchPermissoes();
  }, [token]);

  const handleCheckboxChange = (nome: string, checked: boolean) => {
    setPermissoesSelecionadas((prev) => {
      const novo = new Set(prev);
      if (checked) {
        novo.add(nome);
      } else {
        novo.delete(nome);
      }
      return novo;
    });
  };

  async function enviarPermissoesSelecionadas() {
    try {
      const response = await fetch(`${API_BASE_URL}/rel_permissao_perfil/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          perfil: perfilId,
          permissoes: Array.from(permissoesSelecionadas),
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro?.detail || "Erro ao enviar permissões");
      }

      alert("Permissões atualizadas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao enviar permissões:", error.message || error);
    }
  }

  const columns: ColumnDef<Permissao>[] = [
    {
      id: "select",
      header: "",
      cell: ({ row }) => {
        const nome = row.original.nome;
        return (
          <Checkbox
            checked={permissoesSelecionadas.has(nome)}
            onCheckedChange={(checked) => handleCheckboxChange(nome, !!checked)}
          />
        );
      },
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
    },
    {
      accessorKey: "nome",
      header: "Permissão",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (row.original.status === 1 ? "Ativo" : "Inativo"),
    },
  ];

  const table = useReactTable({
    data: permissoes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Permissões do Perfil: {equipeLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por permissão..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nome")?.setFilterValue(event.target.value)
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
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
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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

        <div className="mt-4 flex justify-end">
          <Button onClick={enviarPermissoesSelecionadas}>
            Salvar Permissões Selecionadas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
