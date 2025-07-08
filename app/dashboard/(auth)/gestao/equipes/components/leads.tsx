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
import { EquipeDrawer } from "./EquipeModal";

type Equipe = {
  id: string;
  promotora: string;
  nome: string;
  descricao: string;
  status: number;
};

type EquipeDrawerProps = {
  isOpen: boolean;
  equipe: Equipe;
  onClose: () => void;
  onRefresh: () => void;
};

const equipeColumns: ColumnDef<Equipe>[] = [
  { accessorKey: "promotora", header: "Promotora" },
  { accessorKey: "nome", header: "Nome da Equipe" },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ getValue }) => {
      const texto = getValue<string>();
      const palavras = texto.split(" ");
      return palavras.slice(0, 3).join(" ") + (palavras.length > 3 ? "..." : "");
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (getValue<number>() === 1 ? "Ativo" : "Inativo")
  }
];

export function EquipesTable() {
  const [equipes, setEquipes] = React.useState<Equipe[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedEquipe, setSelectedEquipe] = React.useState<Equipe | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const { token } = useAuth();

  React.useEffect(() => {
    async function fetchEquipes() {
      try {
        const response = await fetch(`${API_BASE_URL}/equipe/listar`, {
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
        setEquipes(data);
      } catch (error: any) {
        console.error("Erro ao carregar equipes:", error.message || error);
      }
    }

    fetchEquipes();
  }, [token, refreshKey]);

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

  const handleRowDoubleClick = (equipe: Equipe) => {
    setSelectedEquipe(equipe);
  };

  const handleCloseDrawer = () => {
    setSelectedEquipe(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Equipes</CardTitle>
      </CardHeader>

      {!selectedEquipe ? (
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
            <Table  className="w-full table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead className="w-32 truncate overflow-hidden whitespace-nowrap" key={header.id}>
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
                      onDoubleClick={() => handleRowDoubleClick(row.original)}
                      className="hover:bg-muted cursor-pointer">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className="w-32 truncate overflow-hidden whitespace-nowrap" key={cell.id}>
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
      ) : (
        <EquipeDrawer
          isOpen={!!selectedEquipe} // ou true/false conforme sua lógica
          equipe={selectedEquipe}
          onClose={() => {
            handleCloseDrawer();
            handleRefresh();
          }}
          onRefresh={handleRefresh}
        />
      )}
    </Card>
  );
}
