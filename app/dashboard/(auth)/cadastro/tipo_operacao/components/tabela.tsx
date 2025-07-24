"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Subproduto } from "./subprodutos";
import { CarregandoTable } from "./tabela_carregando";
import CadastroTabelaModal from "./cadastroTabela";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Option = {
  id: string;
  nome: string;
};

type Props = {
  subproduto: Subproduto;
  onClose: () => void;
};

export type Taxa = {
  taxa_prazo_hash: string;
  taxa_nome: string;
  status: number;
  prazo_minimo: number;
  taxa_mensal: number;
  prazo_maximo: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  prefixo: string | null;
  vigencia_inicio: string;
  vigencia_prazo: string;
};

export default function TaxaProduto({ subproduto }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taxa, setTaxa] = useState<Option[]>([]);
  const [taxaSelecionado, setTaxaSelecionado] = useState<Option | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [produtosRelacionados, setProdutosRelacionados] = useState<Subproduto[]>([]);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  const columns: ColumnDef<Subproduto>[] = [
    { accessorKey: "nome_tabela", header: "Nome" },
    { accessorKey: "taxa_mensal", header: "Taxa Mensal" },
    { accessorKey: "prazo_minimo", header: "Prazo Mínimo" },
    { accessorKey: "prazo_maximo", header: "Prozo Máximo" },
    { accessorKey: "vigencia_inicio", header: "Vigencia Inicio" },
    { accessorKey: "vigencia_fim", header: "Vigencia Fim" },
    { accessorKey: "incrementador", header: "incrementador" },
    { accessorKey: "periodicidade", header: "periodicidade" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.produtos_subprodutos_status === 1;
        return (
          <Badge
            className={ativo ? "w-24" : "w-24 border border-red-500 bg-transparent text-red-500"}
            variant={ativo ? "default" : "outline"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    },
    // {
    //   id: "editar",
    //   header: "Editar",
    //   cell: ({ row }) => (
    //     <Button
    //       variant="ghost"
    //       size="icon"
    //       onClick={() => onSelectProduto(row.original)}
    //       title="Editar produto">
    //       <Pencil className="h-4 w-4" />
    //     </Button>
    //   ),
    //   enableSorting: false,
    //   enableHiding: false
    // }
  ];

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/produtos-config-tabelas/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.map((c: any) => ({
          id: c.produtos_config_taxa_prazo_id,
          nome: c.nome_tabela
        }));
        setTaxa(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchConvenios();
  }, [token]);

  async function salvarTaxa() {
    try {
      await axios.post(
        `${API_BASE_URL}/rel-produto-tabela-config-sub-produto-convenio/criar`,
        {
          tabela_hash: taxaSelecionado?.id,
          // produto_hash: subproduto.produtos_subprodutos_id,
          tipo_operacao_hash: taxaSelecionado?.nome
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      //   setMessage("Erro ao criar relação com convênio");
      //   setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchRelacionamentos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/produtos-config-tabelas/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        // console.log("data: ", res.data);
        setProdutosRelacionados(res.data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchRelacionamentos();
  }, [token]);

  const table = useReactTable({
    data: produtosRelacionados,
    columns,
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
    <div className="space-y-6 p-6">
      <Card className="">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle>Tabela do Produto</CardTitle>
            <Button id="" onClick={() => setIsCadastroOpen(true)}>
              Nova Tabela
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mt-5 mb-5 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="max-w-[400px] space-y-2">
              <span className="text-muted-foreground text-sm">Tabela</span>
              <Combobox
                data={taxa}
                displayField="nome"
                value={taxaSelecionado}
                onChange={setTaxaSelecionado}
                searchFields={["nome"]}
                placeholder="Selecione uma Taxa"
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button onClick={salvarTaxa}>Salvar</Button>
          </div>

          <div className="mt-10 rounded-md border">
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
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
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
      <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </div>
  );
}
