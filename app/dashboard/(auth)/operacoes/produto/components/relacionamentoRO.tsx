"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Produto } from "./ProdutoModal";
import { CarregandoTable } from "./ro_carregando";
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

export type Ro = {
  id: string;
  nome: string;
  id_relacionamento: any;
};

type Option = {
  id?: string;
  nome?: any;
  equipes?: any;
  ro?: Ro;
  produto: Produto;
  hash?: string;
  status_relacionamento?: any;
  id_relacionamento?: any;
};

export default function RelRO({ produto, equipes }: Option) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ro, setRo] = React.useState<Option[]>([]);
  const [equipesDisponiveis, setEquipesDisponiveis] = React.useState<Option[]>([]);
  const [equipesSelect, setEquipesSelect] = useState<Option | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const { token } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const equipeColumns = React.useMemo<ColumnDef<Option>[]>(() => [
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
              { id: row.original.id_relacionamento, status: novoStatus },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            setRo((prev) =>
              prev.map((item) =>
                item.id_relacionamento === row.original.id_relacionamento
                  ? { ...item, status_relacionamento: novoStatus }
                  : item
              )
            );

            toast.success(`Status atualizado para ${novoStatus === 1 ? "Ativo" : "Inativo"}`);
          } catch (error: any) {
            console.error("Erro ao atualizar status", error);
            toast.error(`Erro ao atualizar status: ${error.response?.data?.detail || error.message}`);
          }
        };

        return (
          <Badge
            onClick={toggleStatus}
            className={`w-24 cursor-pointer ${ativo ? "" : "border border-red-500 bg-transparent text-red-500"}`}
            variant={ativo ? "default" : "outline"}
          >
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    }
  ], []);

  useEffect(() => {
    async function fetchEquipesDisponiveis() {
      try {
        const res = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        const data = res.data.map((p: any) => ({ id: p.rotina_operacional_hash, nome: p.nome }));
        setEquipesDisponiveis(data);
      } catch (error) {
        console.error("Erro ao carregar equipes disponíveis", error);
        toast.error("Erro ao carregar equipes disponíveis");
      }
    }
    fetchEquipesDisponiveis();
  }, [token]);

  useEffect(() => {
    async function fetchProduto() {
      try {
        const res = await axios.get(`${API_BASE_URL}/rel-rotina-operacional-prod-convenio/listar`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });

        const data = res.data.map((p: any) => ({
          id: p.rel_rotina_operacional_prod_convenio_id,
          nome: p.equipe.nome,
          status_relacionamento: p.status_relacionamento,
          id_relacionamento: p.rel_rotina_operacional_prod_convenio_id
        }));
        setRo(data);
      } catch (error) {
        console.error("Erro ao carregar equipes do usuário", error);
        toast.error("Erro ao carregar equipes do usuário");
      }
    }
    fetchProduto();
  }, [token, refreshKey]);

  async function relacionarProRO() {
    if (!equipesSelect) {
      setMessage("Selecione convênio");
      setMessageType("error");
      toast.error("Selecione convênio");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/rel-rotina-operacional-prod-convenio/criar`,
        { rotina_operacional_hash: equipesSelect.id, relacionamento_hash: produto.relacionamento_hash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");
      toast.success("Relação com convênio criada com sucesso!");
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error(error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
      toast.error(`Erro ao criar relação: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const table = useReactTable({
    data: ro,
    columns: equipeColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase()),
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relacionar Produto</CardTitle>
      </CardHeader>

      <CardContent>
        <div>
          <span className="text-muted-foreground text-sm">Roteiros Operacionais</span>
          <Combobox
            data={equipesDisponiveis}
            displayField="nome"
            value={equipesSelect}
            onChange={setEquipesSelect}
            searchFields={["nome"]}
            placeholder="Selecione uma Equipe"
            className="w-full"
          />
          <Button onClick={relacionarProRO} disabled={loading} className="mt-2">
            {loading ? "Salvando..." : "Relacionar Equipe"}
          </Button>

          {message && (
            <p className={`mt-4 text-sm ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      </CardContent>

      <CardContent>
        <div className="rounded-md border px-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isLast = index === headerGroup.headers.length - 1;
                    return (
                      <TableHead
                        key={header.id}
                        className={`truncate overflow-hidden whitespace-nowrap ${isLast ? "w-16" : "w-auto"}`}
                      >
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
                          className={`truncate overflow-hidden whitespace-nowrap ${isLast ? "w-16" : "w-auto"}`}
                        >
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
    </Card>
  );
}
