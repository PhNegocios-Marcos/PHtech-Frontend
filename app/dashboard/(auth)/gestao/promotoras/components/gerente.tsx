"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { useRouter } from "next/navigation";
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
import { CarregandoTable } from "./leads_carregando";
import { Promotora } from "./editPromotora";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Gerente = {
  gerente_nome: string;
  gerente_usuario_hash: string;
  relacionamento_hash: string | null;
};

type UsuariosTableProps = {
  promotora: Promotora;
  cnpj: string;
  onClose: () => void;
};

export function GerenteTable({ cnpj, promotora, onClose }: UsuariosTableProps) {
  const [usuarios, setUsuarios] = useState<Gerente[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { token } = useAuth();
  const router = useRouter();

  // Função para remover gerente - USANDO gerente_usuario_hash
  const removerGerente = useCallback(async (gerente: Gerente) => {
    if (!token || !gerente.gerente_usuario_hash) {
      toast.error("Autenticação necessária ou hash inválido");
      return;
    }

    const payload = {
      id_gestao_gerente_promotora: gerente.gerente_usuario_hash, // ← AQUI: usar gerente_usuario_hash
      status: "0"
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/gestao-promotora-gerente/atualizar`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200) {
        toast.success("Gerente removido com sucesso");
        // Remove o gerente da lista local usando gerente_usuario_hash
        setUsuarios(prev => prev.filter(u => u.gerente_usuario_hash !== gerente.gerente_usuario_hash));
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Erro ao remover gerente:", error);
      toast.error("Falha ao remover gerente");
    }
  }, [token]);

  // Definição das colunas DENTRO do componente
  const usuarioColumns: ColumnDef<Gerente>[] = [
    {
      accessorKey: "gerente_nome",
      header: "Nome do Gerente"
    },
    {
      id: "remover",
      header: "Remover",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removerGerente(row.original)}
          title="Remover Gerente">
          <Trash2 className="h-4 w-4 text-primary" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (!token) {
          toast.error("Token de autenticação não encontrado", {
            style: {
              background: "var(--toast-error)",
              color: "var(--toast-error-foreground)",
              boxShadow: "var(--toast-shadow)"
            }
          });
          sessionStorage.clear();
          router.push("/dashboard/login");
        } else {
          // console.log("tem token");
        }
      }, 2000);
  
      return () => clearTimeout(timeout);
    }, [token, router]);

  useEffect(() => {
    async function fetchUsuariosRelacionados() {
      if (!token || !cnpj) {
        toast.error("Autenticação necessária");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/promotora/${promotora.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        // A API retorna diretamente o array de gerentes
        if (data.gerentes && Array.isArray(data.gerentes)) {
          const usuariosArray: Gerente[] = data.gerentes.map((gerente: any) => ({
            gerente_nome: gerente.gerente_nome,
            gerente_usuario_hash: gerente.gerente_usuario_hash,
            relacionamento_hash: gerente.relacionamento_hash // mesmo sendo null, mantemos para consistência
          }));

          setUsuarios(usuariosArray);
        } else {
          setUsuarios([]);
        }
      } catch (error: any) {
        console.error("Erro na requisição:", error);
        toast.error("Falha ao carregar usuários");
      }
    }

    fetchUsuariosRelacionados();
  }, [token, cnpj, promotora.id]);

  const table = useReactTable({
    data: usuarios,
    columns: usuarioColumns,
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

  const handleClose = () => {
    toast.info("Fechando lista de usuários");
    onClose();
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <h2>
              Usuários Vinculados: <span className="text-primary">{promotora.nome}</span>
            </h2>
          </CardTitle>
          <Button onClick={handleClose} variant="outline">
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("gerente_nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("gerente_nome")?.setFilterValue(event.target.value)
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
      </CardContent>
    </Card>
  );
}