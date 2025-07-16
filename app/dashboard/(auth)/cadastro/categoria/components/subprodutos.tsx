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
import { Pencil } from "lucide-react";
import { SubprodutoEdit } from "./editSubproduto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Subproduto = {
  produtos_subprodutos_id: string;
  produtos_subprodutos_nome: string;
  produtos_subprodutos_atividade: string;
  produtos_subprodutos_status: number;
};

export function SubprodutosTable() {
  const [subprodutos, setSubprodutos] = useState<Subproduto[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedSubproduto, setSelectedSubproduto] = useState<Subproduto | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { token } = useAuth();

  const columns: ColumnDef<Subproduto>[] = [
    { accessorKey: "produtos_subprodutos_nome", header: "Nome" },
    { accessorKey: "produtos_subprodutos_atividade", header: "Atividade" },
    {
      accessorKey: "produtos_subprodutos_status",
      header: "Status",
      cell: ({ getValue }) => (getValue<number>() === 1 ? "Ativo" : "Inativo")
    },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedSubproduto(row.original)}
          title="Editar subproduto">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  useEffect(() => {
    async function fetchSubprodutos() {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/subprodutos/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar subprodutos");
        }

        const data = await response.json();
        console.log("data: ", data)
        setSubprodutos(data);
      } catch (error: any) {
        console.error("Erro na requisição:", error.message || error);
      }
    }

    fetchSubprodutos();
  }, [token, refreshKey]);

  const table = useReactTable({
    data: subprodutos,
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Subprodutos</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedSubproduto ? (
          <SubprodutoEdit 
            subproduto={selectedSubproduto} 
            onClose={() => setSelectedSubproduto(null)} 
            onRefresh={handleRefresh} 
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
          </>
        )}
      </CardContent>
    </Card>
  );
}