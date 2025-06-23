"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { CarregandoTable } from "./leads_carregando";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // substituto visual para Switch

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

        console.log("Resposta da API:", data);

        const arr: ModuloLinha[] = data.map((m: any) => ({
          id: m.id,
          nome: m.nome,
          status: m.status
        }));

        setModulos(arr);
      } catch (error) {
        console.error("Erro ao carregar módulos:", error);
      }
    }

    fetchModulos();
  }, [token]);

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
        return (
          <Badge
            className={ativo ? "w-24" : "w-24 border border-red-500 bg-transparent text-red-500"}
            variant={ativo ? "default" : "outline"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    }
  ];

  const table = useReactTable({
    data: filteredModulos,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  function renderHeader(header: any): React.ReactNode {
    if (typeof header.column.columnDef.header === "function") {
      return (header.column.columnDef.header as (ctx: any) => React.ReactNode)(header.getContext());
    }
    return String(header.column.columnDef.header);
  }

  return (
    <div>
      <Input
        placeholder="Filtrar módulos..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 max-w-sm"
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {!header.isPlaceholder &&
                    (typeof header.column.columnDef.header === "function"
                      ? header.column.columnDef.header(header.getContext() as any)
                      : String(header.column.columnDef.header))}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="p-4 text-center">
                <CarregandoTable />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}

                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
