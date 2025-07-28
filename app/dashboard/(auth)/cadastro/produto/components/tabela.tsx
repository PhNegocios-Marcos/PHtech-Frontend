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
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import ProdutoDetalhesTabs from "./editSubproduto";
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
  id?: string;
  nome: string;
  hash?: string; // opcional
};

type Props = {
  onClose: () => void;
  onSelectTaxa?: (subproduto: Subproduto) => void;
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
  tipo_operacao_nome: string;
};

export default function TaxaProduto({ onSelectTaxa }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [convenio, setConvenio] = useState<Option[]>([]);
  const [convenioSelecionado, setConvenioSelecionado] = useState<Option | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [produtosRelacionados, setProdutosRelacionados] = useState<Subproduto[]>([]);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Subproduto | null>(null);
  const [produtos, setProdutos] = useState<Subproduto[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);
  const [modalidadeSelected, setModalidadeSelected] = useState<Subproduto | null>(null);
  const [modalidade, setModalidade] = useState<Subproduto[]>([]);
  const [categorias, setCategorias] = useState<Option[]>([]);
  const [selectedTaxa, setSelectedTaxa] = useState<Subproduto | null>(null);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  const handleSelectTaxa = (taxa: Subproduto) => {
    setSelectedTaxa(taxa);
  };

  const columns: ColumnDef<Subproduto>[] = [
    { accessorKey: "tipo_operacao_nome", header: "Nome" },
    { accessorKey: "tipo_operacao_prefixo", header: "Prefixo" },
    { accessorKey: "convenio_nome", header: "Convenio" },
    {
      id: "status_relacionamento",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status_relacionamento === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/rel-produto-sub-produto-convenio/atualizar`,
              {
                id: row.original.relacionamento_hash,
                status: novoStatus
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setProdutosRelacionados((prev) =>
              prev.map((item) =>
                item.relacionamento_hash === row.original.relacionamento_hash
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

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/convenio`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.map((c: any) => ({
          id: c.convenio_hash,
          nome: c.convenio_nome
        }));
        setConvenio(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchConvenios();
  }, [token]);

  // Carrega os convenios ao iniciar
  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/produtos/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatado = response.data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          hash: item.id
        }));

        setModalidade(formatado);
      } catch (error) {
        console.error("Erro ao buscar convênios:", error);
      }
    };

    fetchConvenios();
  }, []);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/subprodutos/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const formatado = response.data.map((item: any) => ({
          id: item.produtos_subprodutos_id,
          name: item.produtos_subprodutos_nome
        }));

        setProdutos(formatado);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  async function salvarProduto() {
    try {
      await axios.post(
        `${API_BASE_URL}/rel-produto-sub-produto-convenio/criar`,

        {
          convenio_hash: convenioSelecionado?.id,
          modalidade_hash: modalidadeSelected?.id,
          tipo_operacao_hash: selectedProduto?.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchRelacionamentos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/rel-produto-sub-produto-convenio/listar`, {
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
      {selectedTaxa ? (
        <ProdutoDetalhesTabs subproduto={selectedTaxa} onClose={() => setSelectedTaxa(null)} />
      ) : (
        <Card className="">
          <CardHeader>
            <CardTitle>Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <>
              <div className="mt-5 mb-5 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="max-w-[400px] space-y-2">
                  <span className="text-muted-foreground text-sm">Convenio</span>
                  <Combobox
                    data={convenio}
                    displayField="nome"
                    value={convenioSelecionado}
                    onChange={setConvenioSelecionado}
                    searchFields={["nome"]}
                    placeholder="Selecione uma Taxa"
                  />
                </div>
                <div className="max-w-[400px] space-y-2">
                  <span className="text-muted-foreground text-sm">Modalidade</span>
                  <Combobox
                    data={modalidade}
                    displayField="name"
                    value={modalidadeSelected}
                    onChange={setModalidadeSelected}
                    searchFields={["name"]}
                    placeholder="Selecione uma Taxa"
                  />
                </div>
                <div className="max-w-[400px] space-y-2">
                  <span className="text-muted-foreground text-sm">Tipo de Operação</span>
                  <Combobox
                    data={produtos}
                    displayField="name"
                    value={selectedProduto}
                    onChange={setSelectedProduto}
                    placeholder="Selecione o produto"
                    searchFields={["name"]}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button onClick={salvarProduto}>Salvar</Button>
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
            </>
          </CardContent>
        </Card>
      )}

      <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </div>
  );
}
