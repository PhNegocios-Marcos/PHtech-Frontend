"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cleave from "cleave.js/react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "./Combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const schema = z.object({
  nome_taxa: z.string().min(1, "Nome da tabela é obrigatório"),
  prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
  taxa_mensal: z.string().min(1, "Taxa mensal é obrigatório"),
  incrementador: z.string().min(1, "Taxa mensal é obrigatório"),
  periodiciade: z.string().min(1, "Taxa mensal é obrigatório")
});

type FormData = z.infer<typeof schema>;

type CadastroTabelaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Option = {
  id?: string;
  nome: string;
  hash?: string; // opcional
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

export default function CadastroTabelaModal({ isOpen, onClose }: CadastroTabelaModalProps) {
  const [loading, setLoading] = useState(false);
  const [convenio, setConvenio] = useState<Option[]>([]);
  const [convenioSelecionado, setConvenioSelecionado] = useState<any>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [produtosRelacionados, setProdutosRelacionados] = useState<Taxa[]>([]);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [produtos, setProdutos] = useState<Taxa[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);
  const [modalidadeSelected, setModalidadeSelected] = useState<any>(null);
  const [idProduto, setIdProduto] = useState<any>(null);

  const [modalidade, setModalidade] = useState<Taxa[]>([]);
  const [categorias, setCategorias] = useState<Option[]>([]);
  const [selectedTaxa, setSelectedTaxa] = useState<Taxa | null>(null);

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_taxa: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodiciade: ""
    }
  });
  const { register, handleSubmit, reset } = useForm<FormData>();
  const form = useForm({
    defaultValues: {
      inicio: undefined,
      fim: undefined
    }
  });
  const { inicio, fim } = form.getValues();

  const statusOptions = [{ id: "PERSONALIZADO", name: "PERSONALIZADO" }];

  const { token, userData } = useAuth();
  const router = useRouter();

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
      } catch (error: any) {
        console.error("Erro ao carregar convênios", error);
        toast.error("Erro ao carregar convênios: " + (error.message || "Erro desconhecido"));
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
      } catch (error: any) {
        console.error("Erro ao buscar convênios:", error);
        toast.error("Erro ao buscar convênios: " + (error.message || "Erro desconhecido"));
      }
    };

    fetchConvenios();
  }, [token]);

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
      } catch (error: any) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Erro ao buscar produtos: " + (error.message || "Erro desconhecido"));
      }
    };

    fetchProdutos();
  }, [token]);

  async function salvarProduto() {
    setLoading(true);
    try {
      const response = await axios.post(
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

      toast.success("Relação com convênio criada com sucesso!");
      setIdProduto(response.data);
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao criar relação com convênio: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.");
      return;
    }

    const payload = {
      relacionamento_produto: idProduto?.rel_produto_subproduto_convenio_convenio_id,
      nome_tabela: data.nome_taxa,
      prazo_minimo: data.prazo_minimo,
      prazo_maximo: data.prazo_maximo,
      taxa_mensal: data.taxa_mensal,
      usuario_criacao_hash: (userData as any)?.id ?? "id_user",
      incrementador: data.incrementador,
      periodicidade: data.periodiciade,
      vigencia_inicio: format(inicio ?? new Date(), "yyyy-MM-dd"),
      vigencia_fim: format(fim ?? new Date(), "yyyy-MM-dd")
    };

    try {
      const response = await fetch(`${API_BASE_URL}/produtos-config-tabelas/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      toast.success("Tabela cadastrada com sucesso!");
      reset();
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      toast.error("Erro ao cadastrar usuário: " + (error.message || "Erro desconhecido"));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 z-50 h-full w-2/2 overflow-auto rounded-l-2xl p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <Form {...methods}>
            <div onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Produto</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card>
                <h5 className="mx-5 text-xl font-semibold">Produto</h5>
                <div className="m-5">
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-black">Convenio</span>
                    <div className="w-full">
                      <Combobox
                        data={convenio}
                        displayField="nome"
                        value={{
                          ...convenioSelecionado,
                          nome:
                            convenioSelecionado?.nome?.length > 20
                              ? convenioSelecionado.nome.slice(0, 20) + "..."
                              : convenioSelecionado?.nome
                        }}
                        onChange={setConvenioSelecionado}
                        searchFields={["nome"]}
                        placeholder="Selecione uma Taxa"
                        className=""
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-bold text-black">Modalidade</span>
                    <div className="w-full">
                      <Combobox
                        data={modalidade}
                        displayField="name"
                        value={{
                          ...modalidadeSelected,
                          name:
                            modalidadeSelected?.name?.length > 20
                              ? modalidadeSelected.name.slice(0, 20) + "..."
                              : modalidadeSelected?.name
                        }}
                        onChange={setModalidadeSelected}
                        searchFields={["name"]}
                        placeholder="Selecione uma Taxa"
                        className=""
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-bold text-black">Tipo de operação</span>
                    <div className="w-full">
                      <Combobox
                        data={produtos}
                        displayField="name"
                        value={{
                          ...selectedProduto,
                          name:
                            selectedProduto?.name?.length > 20
                              ? selectedProduto.name.slice(0, 20) + "..."
                              : selectedProduto?.name
                        }}
                        onChange={setSelectedProduto}
                        searchFields={["name"]}
                        placeholder="Selecione o produto"
                        className=""
                      />
                    </div>
                  </div>
                </div>
              </Card>
              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={salvarProduto}>Cadastrar</Button>
              </div>
            </div>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
