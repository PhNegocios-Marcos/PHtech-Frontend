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
import { PromotoraDrawer, Promotora } from "./PromotoraModal";

const promotoraColumns: ColumnDef<Promotora>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "razao_social", header: "Razão Social" },
  { accessorKey: "cnpj", header: "CNPJ" },
  { accessorKey: "representante", header: "Representante" },
  { accessorKey: "master", header: "É Master?" },
  { accessorKey: "rateio_master", header: "Rateio Master" },
  { accessorKey: "rateio_sub", header: "Rateio Sub" },
  { accessorKey: "status", header: "Status" }
];

type PromotorasTableProps = {
  onSelectPromotora: (promotora: Promotora) => void;
};

export function PromotorasTable({ onSelectPromotora }: PromotorasTableProps) {
  const [promotoras, setPromotoras] = React.useState<Promotora[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedPromotora, setSelectedPromotora] = React.useState<Promotora | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { token } = useAuth();

  React.useEffect(() => {
    async function fetchPromotoras() {
      try {
        const response = await fetch(`${API_BASE_URL}/promotora/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar promotoras");
        }

        const data = await response.json();
        const promotorasArray = data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          razao_social: item.razao_social,
          cnpj: item.cnpj,
          representante: item.representante,
          master: item.master,
          master_id: item.master_id,
          rateio_master: item.rateio_master,
          rateio_sub: item.rateio_sub,
          status: item.status
        }));

        setPromotoras(promotorasArray);
      } catch (error: any) {
        console.error("Erro ao buscar promotoras:", error.message || error);
      }
    }

    fetchPromotoras();
  }, [token]);

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

  const handleRowClick = (promotora: Promotora) => {
    onSelectPromotora(promotora); // apenas isso!
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Promotoras</CardTitle>
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
                  <TableRow
                    key={row.id}
                    onDoubleClick={() => handleRowClick(row.original)}
                    className="hover:bg-muted cursor-pointer">
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

        <PromotoraDrawer
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          promotora={selectedPromotora as any} // ajuste conforme sua tipagem no Drawer
        />
      </CardContent>
    </Card>
  );
}
