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
import { CarregandoTable } from "./tabela_carregando";
import { ChevronLeft, ChevronRight, Pencil, Search } from "lucide-react";
import CadastroTabelaModal from "./cadastroNovoProduto";
import { Produto } from "./ProdutoModal";
import { Input } from "@/components/ui/input";
import AtualizarProdutoModal from "./atualizarProduto";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
import { ChevronDownIcon } from "@radix-ui/react-icons";

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
import { toast } from "sonner";
import { maskDate, maskMonth, maskPercentage } from "@/utils/maskTable";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Option = {
  id: string;
  nome: string;
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

export default function TabelaProduto({ produto, onClose }: Props) {
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
  const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedTaxa, setSelectedTaxa] = useState<Produto | null>(null);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [taxa, setTaxa] = useState<Option[]>([]);
  const [taxaSelecionado, setTaxaSelecionado] = useState<Option | null>(null);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  const handleSelectTaxa = (taxa: Produto) => {
    setSelectedTaxa(taxa);
  };

  const form = useForm({
    defaultValues: {
      inicio: undefined,
      fim: undefined
    }
  });

  const columns: ColumnDef<Produto>[] = [
    { accessorKey: "nome_tabela", header: "Nome" },
    { accessorKey: "taxa_mensal", header: "Taxa mensal", cell: (info) => maskPercentage(info)},
    { accessorKey: "prazo_minimo", header: "Prazo mínimo", cell: (info) => maskMonth(info)},
    { accessorKey: "prazo_maximo", header: "Prazo máximo", cell: (info) => maskMonth(info)},
    { accessorKey: "vigencia_inicio", header: "Início da vigência", cell: (info) => maskDate(info)},
    { accessorKey: "vigencia_fim", header: "Fim da vigência", cell: (info) => maskDate(info)},
    { accessorKey: "incrementador", header: "Incrementador", cell: (info) => maskPercentage(info)},
    { accessorKey: "periodicidade", header: "Periodicidade", cell: (info) => maskMonth(info)},
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

            toast.success(`Status atualizado para ${novoStatus === 1 ? "Ativo" : "Inativo"}`, {
              style: {
                background: "var(--toast-success)",
                color: "var(--toast-success-foreground)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          } catch (error: any) {
            console.error("Erro ao atualizar status", error);
            toast.error(
              `Erro ao atualizar status: ${error.response?.data?.detail || error.message}`,
              {
                style: {
                  background: "var(--toast-error)",
                  color: "var(--toast-error-foreground)",
                  boxShadow: "var(--toast-shadow)"
                }
              }
            );
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
    },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setProdutoSelecionado(row.original);
            setIsEditarOpen(true);
          }}
          title="Editar produto">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const { inicio, fim } = form.getValues();

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
      toast.success("Relação com convênio criada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } catch (error: any) {
      console.error(error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
      toast.error(`Erro ao criar relação: ${error.response?.data?.detail || error.message}`, {
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

  useEffect(() => {
    async function fetchRelacionamentos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/produtos-config-tabelas/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        console.log(res);
        setProdutosRelacionados(res.data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
        toast.error("Erro ao carregar convênios", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }

    fetchRelacionamentos();
  }, [token]);

  async function salvarTaxa() {
    console.log("taxaSelecionado: ", taxa);

    try {
      await axios.post(
        `${API_BASE_URL}/rel-produto-tabela-config-sub-produto-convenio/criar`,
        [
          {
            tipo_operacao_hash: selectedCategoria?.id,
            tabela_hash: taxaSelecionado?.id
          }
        ],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");
      toast.success("Relação com convênio criada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } catch (error: any) {
      console.error(error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
      toast.error(`Erro ao criar relação: ${error.response?.data?.detail || error.message}`, {
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

  const table = useReactTable({
    data: produtosRelacionados,
    columns,
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
    <div>
      <Card className="">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <div>
              <CardTitle>Lista de produtos</CardTitle>
            </div>
            {/* <div className="flex flex-row gap-3">
              <Button id="" onClick={() => setIsCadastroOpen(true)}>
                Nova Tabela
              </Button>
              <Button onClick={onClose} variant="outline">
                Voltar
              </Button>
            </div> */}
          </div>
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
      <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
      <AtualizarProdutoModal
        isOpen={isEditarOpen}
        onClose={() => {
          setIsEditarOpen(false);
          setProdutoSelecionado(null);
        }}
        produto={produtoSelecionado}
        onUpdate={() => {
          // Recarregar os dados após a atualização
          // Você pode implementar uma função para recarregar os produtos relacionados
        }}
      />
    </div>
  );
}
