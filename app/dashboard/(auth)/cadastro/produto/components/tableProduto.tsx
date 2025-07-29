"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CarregandoTable } from "./leads_carregando";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
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
import { useForm, FormProvider } from "react-hook-form";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Option = {
  id: string;
  nome: string;
};

export type Produto = {
  id?: string;
  nome?: string;
  status?: number;
  idade_minima?: number;
  idade_maxima?: number;
  prazo_minimo?: number;
  prazo_maximo?: number;
  id_uy3?: string | null;
  cor_grafico?: string | null;
  config_tabela_hash?: string;
  usuario_atualizacao?: string;
  tabela_hash?: string;
};

export type Props = {
  produto?: Produto;
  onClose: () => void;
};

export type Tabela = {
  tabela_hash: string;
  Tabela_nome: string;
  status: number;
  prazo_minimo: number;
  Tabela_mensal: number;
  prazo_maximo: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  prefixo: string | null;
  vigencia_inicio: string;
  vigencia_prazo: string;
};

export default function TabelaProduto({ produto }: Props) {
  const { token, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [Tabela, setTabela] = useState<Option[]>([]);
  const [TabelaSelecionado, setTabelaSelecionado] = useState<Option | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [produtosRelacionados, setProdutosRelacionados] = useState<Produto[]>([]);
  const [selectedTaxa, setSelectedTaxa] = useState<Produto | null>(null);

  const form = useForm({
    defaultValues: {
      inicio: undefined,
      fim: undefined
    }
  });

  const columns: ColumnDef<Produto>[] = [
    { accessorKey: "nome_tabela", header: "Nome" },
    { accessorKey: "taxa_mensal", header: "Taxa Mensal" },
    { accessorKey: "prazo_minimo", header: "Prazo Mínimo" },
    { accessorKey: "prazo_maximo", header: "Prozo Máximo" },
    { accessorKey: "vigencia_inicio", header: "Vigencia Inicio" },
    { accessorKey: "vigencia_fim", header: "Vigencia Fim" },
    { accessorKey: "incrementador", header: "incrementador" },
    { accessorKey: "periodicidade", header: "periodicidade" },
    {
      id: "status_relacionamento",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/produtos-config-tabelas/atualizar`,
              {
                config_tabela_hash: row.original.tabela_hash,
                status: novoStatus,
                usuario_atualizacao: userData.id
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setProdutosRelacionados((prev) =>
              prev.map((item) => {
                if (item.tabela_hash === row.original.tabela_hash) {
                  return { ...item, status: novoStatus };
                }
                return item;
              })
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
    // {
    //   id: "editar",
    //   header: "Editar",
    //   cell: ({ row }) => (
    //     <Button
    //       variant="ghost"
    //       size="icon"
    //       onClick={() => handleSelectTaxa(row.original)}
    //       title="Editar produto">
    //       <Pencil className="h-4 w-4" />
    //     </Button>
    //   ),
    //   enableSorting: false,
    //   enableHiding: false
    // }
  ];

  const { inicio, fim } = form.getValues();

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/config_Tabelas_prazos/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.map((c: any) => ({
          id: c.produtos_config_Tabela_prazo_id,
          nome: c.produtos_config_Tabela_prazo_nome
        }));
        setTabela(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchConvenios();
  }, [token]);

  async function salvarTabela() {
    try {
      await axios.post(
        `${API_BASE_URL}/rel-produto-Tabela/criar`,
        {
          Tabela_prazo_hash: TabelaSelecionado?.id,
          produto_hash: produto?.id,
          vigencia_inicio: format(inicio ?? new Date(), "yyyy-MM-dd"),
          vigencia_fim: format(fim ?? new Date(), "yyyy-MM-dd")
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
    <div className="space-y-6">
      <Card className="">
        <CardHeader>
          <CardTitle>Tabela do Produto</CardTitle>
        </CardHeader>

        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
