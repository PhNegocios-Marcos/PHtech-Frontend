"use client";

import React from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { CarregandoTable } from "./leads_carregando";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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
import { ChevronLeft, ChevronRight, Ellipsis, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PermissoesDrawer } from "./PermissoesModal";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type PermissaoLinha = {
  categoria: string;
  id: string;
  nome: string;
  status: number;
};

export function PermissoesTable() {
  const { token } = useAuth();
  const [permissoes, setPermissoes] = React.useState<PermissaoLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedEquipe, setSelectedEquipe] = React.useState<PermissaoLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    async function fetchPermissoes() {
      if (!token) {
        toast.error("Autenticação necessária", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: "Faça login para acessar as permissões"
        });
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/permissoes/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar permissões");

        const data = await res.json();

        const arr: PermissaoLinha[] = [];
        for (const [categoria, permissoesArray] of Object.entries(data)) {
          for (const p of permissoesArray as any[]) {
            arr.push({
              categoria,
              id: p.id,
              nome: p.nome,
              status: p.status
            });
          }
        }

        setPermissoes(arr);
        // toast.success("Permissões carregadas", {
        //   style: {
        //     background: 'var(--toast-success)',
        //     color: 'var(--toast-success-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   },
        //   description: `${arr.length} permissões encontradas`
        // });
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        toast.error("Falha ao carregar permissões", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: "Tente novamente mais tarde"
        });
      }
    }

    fetchPermissoes();
  }, [token, refreshKey]);

  const filteredPermissoes = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return permissoes.filter(
      (p) =>
        p.nome.toLowerCase().includes(filtroLower) ||
        p.categoria.toLowerCase().includes(filtroLower)
    );
  }, [filtro, permissoes]);

  const columns: ColumnDef<PermissaoLinha>[] = [
    {
      accessorKey: "categoria",
      header: "Módulos",
      cell: (info) => <strong>{info.getValue() as string}</strong>
    },
    {
      accessorKey: "nome",
      header: "Permissão"
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/permissoes/atualizar`,
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

            setPermissoes((prev) =>
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
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar permissão">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredPermissoes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: {
      globalFilter
    }
  });

  const handleRowDoubleClick = (equipe: PermissaoLinha) => {
    setSelectedEquipe(equipe);
    // toast.info("Editando permissão", {
    //   style: {
    //     background: 'var(--toast-info)',
    //     color: 'var(--toast-info-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   },
    //   description: equipe.nome
    // });
  };

  const handleCloseDrawer = () => {
    setSelectedEquipe(null);
    // toast.info("Edição concluída", {
    //   style: {
    //     background: 'var(--toast-info)',
    //     color: 'var(--toast-info-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    // toast.success("Lista atualizada", {
    //   style: {
    //     background: "var(--toast-success)",
    //     color: "var(--toast-success-foreground)",
    //     boxShadow: "var(--toast-shadow)"
    //   }
    // });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <>
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Permissões</CardTitle>
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
                  {table.getRowModel().rows.length ? (
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
                    <CarregandoTable />
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </>
      </Card>
      <PermissoesDrawer
        isOpen={!!selectedEquipe}
        permissao={selectedEquipe}
        onClose={() => {
          handleCloseDrawer();
          handleRefresh();
        }}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
