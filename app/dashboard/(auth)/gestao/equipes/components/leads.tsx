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
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
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
import { EquipeDrawer } from "./EquipeModal";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

export function EquipesTable() {
  const [equipes, setEquipes] = React.useState<Equipe[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedEquipe, setSelectedEquipe] = React.useState<Equipe | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const { token } = useAuth();

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
    },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar equipe">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  React.useEffect(() => {
    async function fetchEquipes() {
      try {
        setLoading(true);
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
        // toast.success("Equipes carregadas com sucesso", {
        //   style: {
        //     background: 'var(--toast-success)',
        //     color: 'var(--toast-success-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   }
        // });
      } catch (error: any) {
        console.error("Erro ao carregar equipes:", error.message || error);
        toast.error("Falha ao carregar equipes", {
          description: error.message || "Tente novamente mais tarde",
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchEquipes();
    }
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  });

  const handleRowDoubleClick = (equipe: Equipe) => {
    setSelectedEquipe(equipe);
    toast.info(`Editando equipe: ${equipe.nome}`, {
      style: {
        background: 'var(--toast-info)',
        color: 'var(--toast-info-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  const handleCloseDrawer = () => {
    setSelectedEquipe(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Lista de equipes atualizada", {
      style: {
        background: 'var(--toast-success)',
        color: 'var(--toast-success-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  return (
    <>
      {!selectedEquipe ? (
        <Card className="col-span-2">
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Equipes</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Filtrar por qualquer campo..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
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
                      {headerGroup.headers.map((header, index) => {
                        const isLast = index === headerGroup.headers.length - 1;
                        return (
                          <TableHead
                            key={header.id}
                            className={`truncate overflow-hidden whitespace-nowrap ${
                              isLast ? "w-16" : "w-auto"
                            }`}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <CarregandoTable />
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        onDoubleClick={() => handleRowDoubleClick(row.original)}
                        className="hover:bg-muted cursor-pointer">
                        {row.getVisibleCells().map((cell, index) => {
                          const isLast = index === row.getVisibleCells().length - 1;
                          return (
                            <TableCell
                              key={cell.id}
                              className={`truncate overflow-hidden whitespace-nowrap ${
                                isLast ? "w-16" : "w-auto"
                              }`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={equipeColumns.length} className="text-center h-24">
                        Nenhuma equipe encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-4">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
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
          </CardContent>
        </Card>
      ) : (
        <EquipeDrawer
          isOpen={!!selectedEquipe}
          equipe={selectedEquipe}
          onClose={() => {
            handleCloseDrawer();
            handleRefresh();
          }}
          onRefresh={handleRefresh}
        />
      )}
    </>
  );
}