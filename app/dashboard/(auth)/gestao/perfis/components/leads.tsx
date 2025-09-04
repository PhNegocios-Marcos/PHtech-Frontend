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
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Equipe = {
  id: string;
  nome: string;
  descricao: string;
  status: number;
};

export function EquipesTable() {
  const [equipes, setEquipes] = React.useState<Equipe[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Equipe | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const { token } = useAuth();

  const equipeColumns: ColumnDef<Equipe>[] = [
    { accessorKey: "nome", header: "Nome da Equipe" },
    { accessorKey: "descricao", header: "Descrição" },
        {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/perfil/atualizar`,
              {
                id: row.original.id,
                status: novoStatus
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setEquipes((prev) =>
              prev.map((item) =>
                item.id === row.original.id ? { ...item, status: novoStatus } : item
              )
            );

            toast.success("Status atualizado com sucesso!", {
              style: {
                background: "var(--toast-success)",
                color: "var(--toast-success-foreground)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          } catch (error: any) {
            toast.error(
              `Erro ao atualizar status: ${error.response?.data?.detail || error.message}`, {
              style: {
                background: "var(--toast-error)",
                color: "var(--toast-error-foreground)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          }
        };

        return (
          <Badge
            onClick={toggleStatus}
            className={`w-24 cursor-pointer ${ativo ? "" : "border-primary text-primary border bg-transparent"}`}
            variant={ativo ? "default" : "outline"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    },
    {
      id: "editar",
      header: "Ver",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row.original)}
          title="Editar usuário">
          <Search className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const handleEditClick = (equipe: Equipe) => {
    setSelectedUser(equipe);
    // toast.info("Editando equipe", {
    //   style: {
    //     background: "var(--toast-info)",
    //     color: "var(--toast-info-foreground)",
    //     boxShadow: "var(--toast-shadow)"
    //   },
    //   description: equipe.nome
    // });
  };

  React.useEffect(() => {
    async function fetchEquipes() {
      if (!token) {
        toast.error("Autenticação necessária", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: "Faça login para acessar as equipes"
        });
        return;
      }

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
        // toast.success("Equipes carregadas com sucesso", {
        //   style: {
        //     background: 'var(--toast-success)',
        //     color: 'var(--toast-success-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   },
        //   description: `${equipesArray.length} equipes encontradas`
        // });
      } catch (error: any) {
        console.error("Erro ao buscar equipes:", error.message || error);
        toast.error("Falha ao carregar equipes", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: error.message || "Erro desconhecido"
        });
      }
    }

    fetchEquipes();
  }, [token]);

  const table = useReactTable({
    data: equipes.reverse(),
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

  const handleCloseDrawer = () => {
    setSelectedUser(null);
    // toast.info("Edição concluída", {
    //   style: {
    //     background: "var(--toast-info)",
    //     color: "var(--toast-info-foreground)",
    //     boxShadow: "var(--toast-shadow)"
    //   }
    // });
  };

  return (
    <>
      {selectedUser ? (
        <PerfilDrawer isOpen={true} onClose={handleCloseDrawer} usuario={selectedUser} />
      ) : (
        <Card className="col-span-2">
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Perfis</CardTitle>
          </CardHeader>
          <CardContent>
            <>
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
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          onDoubleClick={() => handleEditClick(row.original)}
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
                      <CarregandoTable />
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
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
          </CardContent>
        </Card>
      )}
    </>
  );
}
