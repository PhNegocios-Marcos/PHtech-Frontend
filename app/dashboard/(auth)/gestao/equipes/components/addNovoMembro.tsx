"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Usuario = {
  id: string;
  nome: string;
  email: string;
};

type Relacionamento = {
  id_relacionamento: string;
  status_relacionamento: number;
  usuario: { id: string; nome: string };
  equipe: { id: string; nome: string };
};

type UsuarioComStatus = Usuario & {
  status_relacionamento?: number;
  id_relacionamento?: string;
};

type UsuariosTableProps = {
  equipeNome: string;
  onClose: () => void;
};

export function NovoMembro({ equipeNome, onClose }: UsuariosTableProps) {
  const [usuarios, setUsuarios] = useState<UsuarioComStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!token || !equipeNome) return;

      try {
        setLoading(true);

        const [resUsuarios, resRelacionamentos] = await Promise.all([
          fetch(`${API_BASE_URL}/usuario/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/rel_usuario_equipe/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!resUsuarios.ok || !resRelacionamentos.ok) {
          throw new Error("Erro ao carregar dados");
        }

        const usuariosData = await resUsuarios.json();
        const relacionamentosData: Relacionamento[] = await resRelacionamentos.json();

        const relacionadosComEquipe = relacionamentosData.filter(
          (rel) => rel.equipe?.nome === equipeNome
        );

        const usuariosComStatus: UsuarioComStatus[] = usuariosData.map((user: any) => {
          const relacionamento = relacionadosComEquipe.find((rel) => rel.usuario?.id === user.id);

          return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            status_relacionamento: relacionamento?.status_relacionamento,
            id_relacionamento: relacionamento?.id_relacionamento
          };
        });

        setUsuarios(usuariosComStatus);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar membros da equipe", {
          description: "Tente novamente mais tarde",
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

    fetchData();
  }, [token, equipeNome]);

  async function handleCheckboxChange(user: UsuarioComStatus) {
    try {
      if (user.status_relacionamento !== undefined) {
        // Já existe relacionamento, atualizar
        const novoStatus = user.status_relacionamento === 1 ? 0 : 1;
        const response = await fetch(`${API_BASE_URL}/rel_usuario_equipe/atualizar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            id: user.id_relacionamento,
            status: novoStatus
          })
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar membro");
        }

        setUsuarios((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status_relacionamento: novoStatus } : u))
        );

        toast.success(novoStatus === 1 ? "Membro ativado" : "Membro desativado", {
          style: {
            background: 'var(--toast-success)',
            color: 'var(--toast-success-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      } else {
        // Criar novo relacionamento
        const response = await fetch(`${API_BASE_URL}/rel_usuario_equipe/criar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            email: user.email,
            nome: equipeNome
          })
        });

        if (!response.ok) {
          throw new Error("Falha ao adicionar membro");
        }

        // Após criação, recarrega os dados
        const resRelacionamentos = await fetch(`${API_BASE_URL}/rel_usuario_equipe/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const relacionamentosData: Relacionamento[] = await resRelacionamentos.json();

        const relacionamentoCriado = relacionamentosData.find(
          (rel) => rel.usuario.id === user.id && rel.equipe?.nome === equipeNome
        );

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  id_relacionamento: relacionamentoCriado?.id_relacionamento,
                  status_relacionamento: relacionamentoCriado?.status_relacionamento
                }
              : u
          )
        );

        toast.success("Membro adicionado à equipe", {
          style: {
            background: 'var(--toast-success)',
            color: 'var(--toast-success-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      toast.error("Operação falhou", {
        description: "Não foi possível atualizar o membro",
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    }
  }

  const columns: ColumnDef<UsuarioComStatus>[] = [
    {
      accessorKey: "nome",
      header: "Nome"
    },
    {
      accessorKey: "email",
      header: "Email"
    },
    {
      id: "vinculo",
      header: "Na Equipe",
      cell: ({ row }) => {
        const user = row.original;
        const checked = user.status_relacionamento === 1;

        return (
          <input
            type="checkbox"
            checked={checked}
            onChange={() => handleCheckboxChange(user)}
            className="accent-primary h-5 w-5 rounded border-gray-300"
          />
        );
      }
    }
  ];

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <CardTitle>
              Equipe: <span className="text-primary">{equipeNome}</span>
            </CardTitle>
            <Button onClick={onClose} variant="outline">
              Voltar
            </Button>
          </div>
        </CardTitle>
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
              {loading ? (
                <CarregandoTable />
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    Nenhum usuário encontrado.
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