"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Promotora = {
  id: string;
  nome: string;
  usuario: {
    id: string;
    nome: string;
  };
  status_relacionamento: number;
};

type UsuariosTableProps = {
  equipeNome: string;
  onClose: () => void;
};

export function UsuariosPorEquipeTable({ equipeNome, onClose }: UsuariosTableProps) {
  const [promotoras, setPromotoras] = useState<Promotora[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { token } = useAuth();
  const podeCriar = useHasPermission("Equipes_atualizar");

  const promotoraColumns: ColumnDef<Promotora>[] = [
    {
      accessorKey: "usuario.nome",
      header: "Nome do Usuário",
      cell: ({ row }) => row.original.usuario.nome
    },
    {
      accessorKey: "status_relacionamento",
      header: "Status",
      cell: ({ getValue }) => (getValue<number>() === 1 ? "Ativo" : "Inativo")
    },
    {
      id: "status_relacionamento",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status_relacionamento === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/rel_usuario_perfil/atualizar`,
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

            setPromotoras((prev) =>
              prev.map((item) =>
                item.id === row.original.id ? { ...item, status_relacionamento: novoStatus } : item
              )
            );

            toast.success("Status atualizado com sucesso!", {
              style: {
                background: "var(--toast-success)",
                color: "var(--toast-success-foreground)",
                border: "1px solid var(--toast-border)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          } catch (error: any) {
            console.error("Erro ao atualizar status", error);
            toast.error(`Erro ao atualizar status: ${error.message}`, {
              style: {
                background: "var(--toast-error)",
                color: "var(--toast-error-foreground)",
                border: "1px solid var(--toast-border)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          }
        };

        return (
          <>
            {podeCriar ? (
              <Badge
                onClick={toggleStatus}
                className={`w-24 cursor-pointer ${ativo ? "" : "border-primary text-primary border bg-transparent"}`}
                variant={ativo ? "default" : "outline"}>
                {ativo ? "Ativo" : "Inativo"}
              </Badge>
            ) : (
              <Badge
                className={`w-24 cursor-pointer ${ativo ? "" : "border-primary text-primary border bg-transparent"}`}
                variant={ativo ? "default" : "outline"}>
                {ativo ? "Ativo" : "Inativo"}
              </Badge>
            )}
          </>
        );
      }
    }
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
        // console.log("token null");
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  useEffect(() => {
    async function fetchPromotorasRelacionadas() {
      if (!token || !equipeNome) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/rel_usuario_equipe/${equipeNome}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar usuários da equipe");
        }

        const data = await response.json();
        const usuariosFormatados = data.usuarios
          .map((usuario: any) => ({
            id: usuario.id_relacionamento,
            nome: usuario.usuario.nome,
            usuario: {
              id: usuario.usuario.id,
              nome: usuario.usuario.nome
            },
            status_relacionamento: usuario.status_relacionamento
          }))
          .filter((usuario: any) => usuario.status_relacionamento === 1);

        setPromotoras(usuariosFormatados);
        // toast.success(`Usuários da equipe ${equipeNome} carregados`, {
        //   style: {
        //     background: 'var(--toast-success)',
        //     color: 'var(--toast-success-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   }
        // });
      } catch (error: any) {
        console.error("Erro na requisição:", error.message || error);
        toast.error("Falha ao carregar usuários", {
          description: error.message || "Tente novamente mais tarde",
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPromotorasRelacionadas();
  }, [token, equipeNome]);

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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Equipe: <span className="text-primary">{equipeNome}</span>
          </CardTitle>

          <Button onClick={onClose} variant="outline">
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("usuario.nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("usuario.nome")?.setFilterValue(event.target.value)
            }
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
              {loading ? (
                <CarregandoTable />
              ) : table.getRowModel().rows.length ? (
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
                <TableRow>
                  <TableCell colSpan={promotoraColumns.length} className="h-24 text-center">
                    Nenhum usuário encontrado na equipe
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
