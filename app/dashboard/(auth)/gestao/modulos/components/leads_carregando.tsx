"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Usuario = {
  id: string;
  nome: string;
  endereco: string;
  status: number;
};

const usuarioColumns: ColumnDef<Usuario>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "status", header: "Status" }
];

export function CarregandoTable() {
  return (
    <TableRow>
      <TableCell colSpan={usuarioColumns.length} className="h-24 text-center">
        <Table className="mx-auto">
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCell>
    </TableRow>
  );
}
