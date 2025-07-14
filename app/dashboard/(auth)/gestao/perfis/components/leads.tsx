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
import { useAuth } from "@/contexts/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { CarregandoTable } from "./leads_carregando";
import { PerfilDrawer } from "./PerfilModal";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

type Equipe = {
  id: string;
  nome: string;
  descricao: string;
  status: number;
};

const equipeColumns: ColumnDef<Equipe>[] = [
  { accessorKey: "nome", header: "Nome da Equipe" },
  { accessorKey: "descricao", header: "Descrição" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const valor = getValue<number>();
      return valor === 1 ? "Ativo" : "Inativo";
    }
  }
];

export function EquipesTable() {
  const [equipes, setEquipes] = React.useState<Equipe[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Equipe | null>(null);

  const { token } = useAuth();

  React.useEffect(() => {
    async function fetchEquipes() {
      try {
        const response = await fetch(`${API_BASE_URL}/perfil/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar equipes");
        }

        const data = await response.json();
        const equipesArray = data.map((equipe: any) => ({
          id: equipe.id,
          nome: equipe.nome,
          descricao: equipe.descricao,
          status: equipe.status
        }));

        setEquipes(equipesArray);
      } catch (error: any) {
        console.error("Erro ao buscar equipes:", error.message || error);
      }
    }

    fetchEquipes();
  }, [token]);

  const table = useReactTable({
    data: equipes,
    columns: equipeColumns,
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
        <CardTitle>Perfis</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          <PerfilDrawer
            isOpen={true}
            onClose={() => setSelectedUser(null)}
            usuario={selectedUser}
          />
        ) : (
          <>
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
              <Table className="w-full table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          className="w-32 truncate overflow-hidden whitespace-nowrap"
                          key={header.id}>
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
                        className="hover:bg-muted cursor-pointer"
                        onDoubleClick={() => setSelectedUser(row.original)}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            className="w-32 truncate overflow-hidden whitespace-nowrap"
                            key={cell.id}>
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
