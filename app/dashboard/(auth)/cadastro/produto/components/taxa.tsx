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
import { Produto } from "./produtos";
import { CarregandoTable } from "./leads_carregando";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Option = {
  id: string;
  nome: string;
};

type Props = {
  produto: Produto;
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

export default function TaxaProduto({ produto }: Props) {
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
  const [produtosRelacionados, setProdutosRelacionados] = useState<Produto[]>([]);

  const form = useForm({
    defaultValues: {
      inicio: undefined,
      fim: undefined
    }
  });

  const columns: ColumnDef<Produto>[] = [
    { accessorKey: "taxa_nome", header: "Nome" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (getValue<number>() === 1 ? "Ativo" : "Inativo")
    },
    { accessorKey: "prazo_minimo", header: "Prazo Mínimo" },
    { accessorKey: "prazo_maximo", header: "Prozo Máximo" },
    { accessorKey: "vigencia_inicio", header: "Vigencia Inicio" },
    { accessorKey: "vigencia_prazo", header: "Prazo Máximo" }
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

  const { inicio, fim } = form.getValues();

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/config_taxas_prazos/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.map((c: any) => ({
          id: c.produtos_config_taxa_prazo_id,
          nome: c.produtos_config_taxa_prazo_nome
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
        `${API_BASE_URL}/rel-produto-taxa/criar`,
        {
          taxa_prazo_hash: taxaSelecionado?.id,
          produto_hash: produto.id,
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
        const res = await axios.get(`${API_BASE_URL}/rel-produto-taxa/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        console.log("data: ", res.data);
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
          <CardTitle>Taxa do Produto</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mt-5 mb-5 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="max-w-[400px] space-y-2">
              <span className="text-muted-foreground text-sm">Taxa</span>
              <Combobox
                data={taxa}
                displayField="nome"
                value={taxaSelecionado}
                onChange={setTaxaSelecionado}
                searchFields={["nome"]}
                placeholder="Selecione um convênio"
              />
            </div>
            <div>
              {/* ✅ Formulário com contexto */}
              <FormProvider {...form}>
                <Form {...form}>
                  <form className="space-y-8">
                    <FormField
                      control={form.control}
                      name="inicio"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Inicio da vigência</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}>
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </FormProvider>
            </div>
            <div>
              {/* ✅ Formulário com contexto */}
              <FormProvider {...form}>
                <Form {...form}>
                  <form className="space-y-8">
                    <FormField
                      control={form.control}
                      name="fim"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fim da vigência</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}>
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </FormProvider>
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
        </CardContent>
      </Card>
    </div>
  );
}
