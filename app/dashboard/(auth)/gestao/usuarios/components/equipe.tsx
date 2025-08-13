"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Usuario } from "./leads";
import { CarregandoTable } from "./leads_carregando";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Equipe = {
  id: string;
  nome: string;
  id_relacionamento: any;
};

type Option = {
  id?: string;
  nome?: any;
  equipes?: any;
  equipe?: Equipe;
  usuario: Usuario;
  hash?: string; // opcional
  status_relacionamento?: any;
  id_relacionamento?: any;
  onClose: () => void;
    onRefresh?: () => void; // Adicione esta linha

};

export default function Equipes({ usuario, equipes, onClose }: Option) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [equipe, setEquipe] = React.useState<Option[]>([]); // para tabela: equipes vinculadas ao usuário
  const [equipesDisponiveis, setEquipesDisponiveis] = React.useState<Option[]>([]); // para combobox: todas as equipes disponíveis
  const [equipesSelect, setEquipesSelect] = useState<Option | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const { token } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const equipeColumns = React.useMemo<ColumnDef<Option>[]>(
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
                `${API_BASE_URL}/rel_usuario_equipe/atualizar`,
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

              setEquipe((prev) =>
                prev.map((item) =>
                  item.id_relacionamento === row.original.id_relacionamento
                    ? { ...item, status_relacionamento: novoStatus }
                    : item
                )
              );
            } catch (error) {
              console.error("Erro ao atualizar status", error);
            }
          };

          return (
            <Badge
              onClick={toggleStatus}
              className={`w-24 cursor-pointer ${ativo ? "" : "border border-red-500 bg-transparent text-red-500"}`}
              variant={ativo ? "default" : "outline"}>
              {ativo ? "Ativo" : "Inativo"}
            </Badge>
          );
        }
      }
    ],
    []
  );

  // Fetch todas as equipes para o Combobox
  useEffect(() => {
    async function fetchEquipesDisponiveis() {
      try {
        const res = await axios.get(`${API_BASE_URL}/equipe/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((p: any) => ({
          id: p.id,
          nome: p.nome
        }));
        setEquipesDisponiveis(data);
      } catch (error) {
        console.error("Erro ao carregar equipes disponíveis", error);
      }
    }
    fetchEquipesDisponiveis();
  }, [token]);

  // Fetch equipes vinculadas ao usuário para a tabela
  useEffect(() => {
    async function fetchEquipe() {
      try {
        const res = await axios.get(`${API_BASE_URL}/rel_usuario_equipe/${usuario.email}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.equipes.map((p: any) => ({
          id: p.equipe.id,
          nome: p.equipe.nome,
          id_relacionamento: p.id_relacionamento,
          status_relacionamento: p.status_relacionamento // <- ADICIONE ISSO
        }));

        setEquipe(data);
      } catch (error) {
        console.error("Erro ao carregar equipes do usuário", error);
      }
    }
    fetchEquipe();
  }, [token, usuario.email, refreshKey]);

  async function relacionarEquipe() {
    if (!equipesSelect) {
      setMessage("Selecione convênio");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await axios.post(
        `${API_BASE_URL}/rel_usuario_equipe/criar`,
        {
          nome: equipesSelect.nome,
          email: usuario.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");
      setRefreshKey((prev) => prev + 1); // Atualiza tabela após criar
    } catch (error) {
      console.error(error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  const table = useReactTable({
    data: equipe,
    columns: equipeColumns,
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
            Relacionar Produto: <span className="text-primary">{usuario.nome}</span>
          </CardTitle>
          <Button onClick={onClose} variant="outline">
            Voltar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mt-5 mb-5">
          {/* Coluna 1 - Convênio */}
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">Equipes</span>
            <Combobox
              data={equipesDisponiveis}
              displayField="nome"
              value={equipesSelect}
              onChange={setEquipesSelect}
              searchFields={["nome"]}
              placeholder="Selecione uma Equipe"
              className="w-full"
            />
            <Button onClick={relacionarEquipe} disabled={loading} className="mt-2">
              {loading ? "Salvando..." : "Relacionar Equipe"}
            </Button>
          </div>
        </div>

        {/* Mensagem de sucesso ou erro */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}>
            {message}
          </p>
        )}
      </CardContent>
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
            {table.getRowModel().rows.length ? (
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
              <CarregandoTable />
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
