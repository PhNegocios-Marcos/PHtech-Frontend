"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender
} from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type AlcadaLinha = {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
};

export function AlcadasTable() {
  const { token } = useAuth();
  const [alcadas, setAlcadas] = React.useState<AlcadaLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");

  React.useEffect(() => {
    async function fetchAlcadas() {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/alcada/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar alcadas");

        const data = await res.json();

        const arr: AlcadaLinha[] = data.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          descricao: a.descricao,
          valor: a.valor
        }));

        setAlcadas(arr);
      } catch (error) {
        console.error("Erro ao carregar alcadas:", error);
      }
    }

    fetchAlcadas();
  }, [token]);

  const filteredAlcadas = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return alcadas.filter((a) => a.nome.toLowerCase().includes(filtroLower));
  }, [filtro, alcadas]);

  const columns: ColumnDef<AlcadaLinha>[] = [
    {
      accessorKey: "nome",
      header: "Nome"
    },
    {
      accessorKey: "valor",
      header: "Valor"
    },
    {
      accessorKey: "descricao",
      header: "Descrição"
    }
  ];

  const table = useReactTable({
    data: filteredAlcadas,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div>
      <Input
        placeholder="Filtrar alcadas..."
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
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
