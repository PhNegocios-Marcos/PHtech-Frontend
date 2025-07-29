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
import Produto from "./produtos";
// import { Subproduto } from "./subprodutos";

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

// type Props = {
//   onClose: () => void;
//   onSelectTaxa?: (produto: Produto) => void;
// };

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
  const [convenioSelecionado, setConvenioSelecionado] = useState<Option | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
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
    setLoading(true); // Geralmente você inicia o loading antes da requisição
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

      console.log("Resposta da API:", response);

      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");

      setIdProduto(response);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    const payload = {
      relacionamento_produto: idProduto.rel_produto_subproduto_convenio_convenio_id,
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

      alert("Tabela cadastrada com sucesso!");
      reset(); // limpa o formulário
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário: " + error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-2/2 overflow-auto bg-white p-6 shadow-lg md:w-1/2">
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

              <Card className="mt-5 flex-grow overflow-auto">
                <h5 className="mx-5 text-xl font-semibold">Tabela Taxa</h5>
                <CardContent>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="nome_taxa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Tabela</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="prazo_minimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prozo mínimo</FormLabel>
                          <FormControl>
                            <Input placeholder="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="prazo_maximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo máximo</FormLabel>
                          <FormControl>
                            <Input placeholder="64" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="taxa_mensal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa mensal</FormLabel>
                          <FormControl>
                            <Input placeholder="1.6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="incrementador"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incrementador</FormLabel>
                          <FormControl>
                            <Combobox
                              data={statusOptions}
                              displayField="name"
                              value={statusOptions.find((opt) => opt.id === field.value) ?? null}
                              onChange={(selected) => field.onChange(selected?.id ?? 1)}
                              searchFields={["name"]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="periodiciade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Periodiciade</FormLabel>
                          <FormControl>
                            <Input placeholder="12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormProvider {...form}>
                        <Form {...form}>
                          <div className="space-y-8">
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
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}>
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Selecione data</span>
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
                          </div>
                        </Form>
                      </FormProvider>
                    </div>
                    <div>
                      <FormProvider {...form}>
                        <Form {...form}>
                          <div className="space-y-8">
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
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}>
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Selecione data</span>
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
                          </div>
                        </Form>
                      </FormProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </div>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
