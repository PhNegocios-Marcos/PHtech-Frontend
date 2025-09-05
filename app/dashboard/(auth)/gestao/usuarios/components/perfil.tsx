"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Usuario } from "./leads";
import { CarregandoTable } from "./leads_carregando";
import { useRouter } from "next/navigation";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type PerfilType = {
  id?: string;
  nome: string;
  id_relacionamento: any;
};

type Option = {
  id?: string;
  nome?: any;
  perfis?: any;
  perfil?: PerfilType;
  usuario: Usuario;
  hash?: string;
  status_relacionamento?: any;
  id_relacionamento?: any;
  onClose: () => void;
  onRefresh?: () => void;
};

export default function Perfil({ usuario, perfis, onClose }: Option) {
  const podeCriar = useHasPermission("Usuarios_atualizar");

  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = React.useState<Option[]>([]);
  const [perfisDisponiveis, setPerfisDisponiveis] = React.useState<Option[]>([]);
  const [perfisSelect, setPerfisSelect] = useState<Option | null>(null);
  const { token, selectedPromotoraId } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isLoadingPerfis, setIsLoadingPerfis] = React.useState(true);
  const router = useRouter();

  const perfilColumns = React.useMemo<ColumnDef<Option>[]>(
    () => [
      { accessorKey: "nome", header: "Nome" },
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
                  id: row.original.id_relacionamento,
                  status: novoStatus
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                }
              );

              setPerfil((prev) =>
                prev.map((item) =>
                  item.id_relacionamento === row.original.id_relacionamento
                    ? { ...item, status_relacionamento: novoStatus }
                    : item
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
                  className={`w-24 cursor-pointer ${ativo ? "" : "border border-red-500 bg-transparent text-red-500"}`}
                  variant={ativo ? "default" : "outline"}>
                  {ativo ? "Ativo" : "Inativo"}
                </Badge>
              ) : (
                <Badge
                  className={`w-24 cursor-pointer ${ativo ? "" : "border border-red-500 bg-transparent text-red-500"}`}
                  variant={ativo ? "default" : "outline"}>
                  {ativo ? "Ativo" : "Inativo"}
                </Badge>
              )}
            </>
          );
        }
      }
    ],
    [token]
  );

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

  // Fetch todos os perfis para o Combobox
  useEffect(() => {
    async function fetchPerfisDisponiveis() {
      try {
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        const res = await axios.get(`${API_BASE_URL}/perfil/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((p: any) => ({
          id: p.id,
          nome: p.nome
        }));
        setPerfisDisponiveis(data);
      } catch (error: any) {
        console.error("Erro ao carregar perfis disponíveis", error);
        toast.error(`Erro ao carregar perfis: ${error.message}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            border: "1px solid var(--toast-border)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }
    fetchPerfisDisponiveis();
  }, [token]);

  // Fetch perfis vinculados ao usuário para a tabela
  useEffect(() => {
    async function fetchPerfisUsuario() {
      setIsLoadingPerfis(true);
      try {
        if (!token || !usuario.id) {
          throw new Error("Token de autenticação ou ID do usuário não encontrado");
        }

        const res = await axios.get(`${API_BASE_URL}/rel_usuario_perfil/${usuario.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        // Ajuste esta parte conforme a estrutura da resposta da API
        const data = res.data.map((p: any) => ({
          id: p.perfil.id,
          nome: p.perfil.nome,
          id_relacionamento: p.id_relacionamento,
          status_relacionamento: p.status_relacionamento
        }));

        setPerfil(data);
      } catch (error: any) {
        console.error("Erro ao carregar perfis do usuário", error);
        toast.error(`Erro ao carregar perfis do usuário: ${error.message}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            border: "1px solid var(--toast-border)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      } finally {
        setIsLoadingPerfis(false);
      }
    }
    fetchPerfisUsuario();
  }, [token, usuario.id, refreshKey]);

  async function relacionarPerfil() {
    if (!perfisSelect) {
      toast.error("Selecione um perfil para vincular", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          border: "1px solid var(--toast-border)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      await axios.post(
        `${API_BASE_URL}/rel_usuario_perfil/criar`,
        {
          promotora_hash: selectedPromotoraId,
          nome: perfisSelect.nome,
          email: usuario.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Perfil vinculado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          border: "1px solid var(--toast-border)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      setRefreshKey((prev) => prev + 1);
      setPerfisSelect(null);
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro ao vincular perfil: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          border: "1px solid var(--toast-border)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } finally {
      setLoading(false);
    }
  }

  const table = useReactTable({
    data: perfil,
    columns: perfilColumns,
    getCoreRowModel: getCoreRowModel(),
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Editar Usuário: <span className="text-primary">{usuario.nome}</span>
          </CardTitle>
          <Button onClick={onClose} variant="outline">
            Voltar
          </Button>
        </div>
      </CardHeader>

      {podeCriar && (
        <CardContent>
          <div className="mt-5 mb-5">
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">Perfil</span>
              <Combobox
                data={perfisDisponiveis}
                displayField="nome"
                value={perfisSelect}
                onChange={setPerfisSelect}
                searchFields={["nome"]}
                placeholder="Selecione um Perfil"
                className="w-full"
              />
              <Button onClick={relacionarPerfil} disabled={loading} className="mt-2">
                {loading ? "Salvando..." : "Relacionar Perfil"}
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      <div className="mx-6 rounded-md border">
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
            {isLoadingPerfis ? (
              <CarregandoTable />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted cursor-pointer">
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
                <TableCell colSpan={perfilColumns.length} className="h-24 text-center">
                  Nenhum perfil vinculado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
