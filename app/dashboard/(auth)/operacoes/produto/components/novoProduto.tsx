"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, FormProvider, Controller } from "react-hook-form";
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
import GlassCard from "@/components/glassCardComponent";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Schema de validação combinado
const schema = z
  .object({
    // Dados do produto
    convenio_hash: z.string().min(1, "Convênio é obrigatório"),
    modalidade_hash: z.string().min(1, "Modalidade é obrigatória"),
    tipo_operacao_hash: z.string().min(1, "Tipo de operação é obrigatório"),
    dias_validade_ccb: z.string().min(1, "Validade da CCB é obrigatório"),
    bancalizador: z.string().min(1, "Bancarizador é obrigatório"),
    seguradora: z.string().min(1, "Seguradora é obrigatória"),
    seguro: z.string().min(1, "Seguro é obrigatório"),
    RO: z.string().min(1, "RO é obrigatório"),

    // Dados da taxa
    nome_taxa: z.string().min(1, "Nome da tabela é obrigatório"),
    prazo_minimo: z
      .string()
      .min(1, "Prazo mínimo é obrigatório")
      .refine((val) => !isNaN(Number(val)), "Deve ser um número"),
    prazo_maximo: z
      .string()
      .min(1, "Prazo máximo é obrigatório")
      .refine((val) => !isNaN(Number(val)), "Deve ser um número"),
    taxa_mensal: z
      .string()
      .min(1, "Taxa mensal é obrigatória")
      .refine((val) => !isNaN(Number(val)), "Deve ser um número"),
    incrementador: z.string().min(1, "Incrementador é obrigatório"),
    periodiciade: z
      .string()
      .min(1, "Periodicidade é obrigatória")
      .refine((val) => !isNaN(Number(val)), "Deve ser um número"),
    inicio: z.date({ required_error: "Data de início é obrigatória" }),
    fim: z.date({ required_error: "Data de fim é obrigatória" })
  })
  .refine((data) => new Date(data.fim) > new Date(data.inicio), {
    message: "Data de fim deve ser após a data de início",
    path: ["fim"]
  });

type FormData = z.infer<typeof schema>;

type CadastroCompletoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Option = {
  id?: string | number;
  nome: string | number;
  hash?: string | number;
  name?: string | number;
  status?: number;
  data_inclusao?: string;
  data_atualizacao?: string;
  tradutores?: Array<{
    [key: string]: {
      campo_interno: string;
      campo_externo: string;
      status: number;
      data_inclusao: string;
      data_atualizacao: string;
    };
  }>;
  credenciais?: any[];
  cadastros?: any[];
};

// Campos de texto repetidos (para reduzir código)
// Campos de texto repetidos (para reduzir código)
const textFields = [
  { name: "nome_taxa", label: "Nome Tabela", placeholder: "Digite o nome", type: "text" },
  { name: "taxa_mensal", label: "Taxa mensal", placeholder: "1.6", type: "number" },
  { name: "periodiciade", label: "Periodicidade", placeholder: "12", type: "number" }
] as const;

const prazoFields = [
  { name: "prazo_minimo", label: "Prazo mínimo", placeholder: "12", type: "number" },
  { name: "prazo_maximo", label: "Prazo máximo", placeholder: "64", type: "number" }
] as const;

export default function CadastroCompletoModal({ isOpen, onClose }: CadastroCompletoModalProps) {
  const [loading, setLoading] = useState(false);
  const [convenio, setConvenio] = useState<Option[]>([]);
  const [modalidade, setModalidade] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);
  const [RO, setRO] = useState<Option[]>([]);
  const [bancarizador, setBancarizador] = useState<Option[]>([]);
  const [seguro, setSeguro] = useState<Option[]>([]);
  const [seguradora, setSeguradora] = useState<Option[]>([]);

  const { token, userData } = useAuth();
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      convenio_hash: "",
      modalidade_hash: "",
      tipo_operacao_hash: "",
      dias_validade_ccb: "",
      nome_taxa: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodiciade: "",
      inicio: undefined,
      fim: undefined,
      RO: "",
      bancalizador: "",
      seguradora: "",
      seguro: ""
    }
  });

  // Carrega os convênios
  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/convenio`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((c: any) => ({ id: c.convenio_hash, nome: c.convenio_nome }));
        setConvenio(data);
      } catch (error: any) {
        console.error("Erro ao carregar convênios", error);
        toast.error("Erro ao carregar convênios: " + (error.message || "Erro desconhecido"));
      }
    }

    if (isOpen && token) {
      fetchConvenios();
    }
  }, [isOpen, token]);

  // Carrega as modalidades
  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/produtos/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatado = response.data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          nome: item.nome
        }));
        setModalidade(formatado);
      } catch (error: any) {
        console.error("Erro ao buscar modalidades:", error);
        toast.error("Erro ao buscar modalidades: " + (error.message || "Erro desconhecido"));
      }
    };

    if (isOpen && token) {
      fetchModalidades();
    }
  }, [isOpen, token]);

  // Carrega os produtos (tipos de operação)
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/subprodutos/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatado = response.data.map((item: any) => ({
          id: item.produtos_subprodutos_id,
          name: item.produtos_subprodutos_nome,
          nome: item.produtos_subprodutos_nome
        }));
        setProdutos(formatado);
      } catch (error: any) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Erro ao buscar produtos: " + (error.message || "Erro desconhecido"));
      }
    };

    if (isOpen && token) {
      fetchProdutos();
    }
  }, [isOpen, token]);

  // Carrega Rotina Operacional
  useEffect(() => {
    const fetchRO = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatado = response.data.map((item: any) => ({
          id: item.rotina_operacional_hash,
          name: item.nome,
          nome: item.nome
        }));
        setRO(formatado);
      } catch (error: any) {
        console.error("Erro ao buscar RO:", error);
        toast.error("Erro ao buscar RO: " + (error.message || "Erro desconhecido"));
      }
    };

    if (isOpen && token) {
      fetchRO();
    }
  }, [isOpen, token]);

  useEffect(() => {
    const fetchBancarizadores = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bancarizador/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Processar a nova estrutura de array de objetos com UUIDs dinâmicos
        const formatado = response.data.map((item: any) => {
          // Extrair a chave UUID dinâmica
          const uuid = Object.keys(item)[0];
          const bancoData = item[uuid];
          return {
            id: uuid,
            name: bancoData.nome,
            nome: bancoData.nome,
            status: bancoData.status,
            tradutores: bancoData.tradutores,
            credenciais: bancoData.credenciais
          };
        });

        setBancarizador(formatado);
      } catch (error: any) {
        console.error("Erro ao buscar bancarizador:", error);
        toast.error("Erro ao buscar bancarizador: " + (error.message || "Erro desconhecido"));
      }
    };

    if (isOpen && token) {
      fetchBancarizadores();
    }
  }, [isOpen, token]);

  useEffect(() => {
    const fetchSeguradoras = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/seguradoras/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Processar o formato de array de objetos das seguradoras
        const formatado = response.data.map((item: any) => {
          return {
            id: item.seguradora_hash,
            nome: item.nome,
            name: item.nome,
            razao_social: item.razao_social,
            cnpj: item.cnpj,
            status: item.status,
            seguradora_hash: item.seguradora_hash
          };
        });

        setSeguradora(formatado);
      } catch (error: any) {
        console.error("Erro ao buscar seguradora:", error);
        toast.error("Erro ao buscar seguradora: " + (error.message || "Erro desconhecido"));
      }
    };

    if (isOpen && token) {
      fetchSeguradoras();
    }
  }, [isOpen, token]);

  useEffect(() => {
    const fetchSeguro = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/seguro-faixas/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Processar o novo formato de array de objetos com as faixas de seguro
        const formatado = response.data.map((item: any) => {
          return {
            id: item.seguro_faixa_hash,
            faixa_inicio: item.faixa_inicio,
            faixa_fim: item.faixa_fim,
            valor_seguradora: item.valor_seguradora,
            valor_pago_cliente: item.valor_pago_cliente,
            status: item.status,
            nome: item.nome,
            seguro_faixa_hash: item.seguro_faixa_hash,
            name: item.nome
          };
        });

        setSeguro(formatado);
      } catch (error: any) {
        console.error("Erro ao buscar seguro:", error);
        toast.error("Erro ao buscar seguro: " + (error.message || "Erro desconhecido"));
      }
    };

    if (isOpen && token) {
      fetchSeguro();
    }
  }, [isOpen, token]);

  // Função para salvar tudo de uma vez
  const onSubmit = async (data: FormData) => {
    console.log("Dados do formulário:", data);
    setLoading(true);

    try {
      // Primeiro: Criar o relacionamento do produto
      const produtoResponse = await axios.post(
        `${API_BASE_URL}/rel-produto-sub-produto-convenio/criar`,
        {
          convenio_hash: data.convenio_hash,
          modalidade_hash: data.modalidade_hash,
          tipo_operacao_hash: data.tipo_operacao_hash,
          dias_validade_ccb: data.dias_validade_ccb
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const relacionamentoId = produtoResponse.data.rel_produto_subproduto_convenio_id;

      // Criar relação com rotina operacional
      await axios.post(
        `${API_BASE_URL}/rel-rotina-operacional-prod-convenio/criar`,
        {
          rotina_operacional_hash: data.RO,
          relacionamento_hash: relacionamentoId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Segundo: Criar a taxa com o relacionamento
      const taxaPayload = {
        relacionamento_produto_hash: relacionamentoId,
        nome_tabela: data.nome_taxa,
        prazo_minimo: data.prazo_minimo,
        prazo_maximo: data.prazo_maximo,
        taxa_mensal: data.taxa_mensal,
        usuario_criacao_hash: (userData as any)?.id ?? "id_user",
        incrementador: data.incrementador,
        periodicidade: data.periodiciade,
        vigencia_inicio: format(data.inicio, "yyyy-MM-dd"),
        vigencia_fim: format(data.fim, "yyyy-MM-dd"),
        bancarizador: data.bancalizador,
        seguradora: data.seguradora,
        seguro: data.seguro
      };

      console.log("Enviando payload:", taxaPayload);

      const taxaResponse = await fetch(`${API_BASE_URL}/produtos-config-tabelas/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taxaPayload)
      });

      if (!taxaResponse.ok) {
        const err = await taxaResponse.json();
        throw new Error(JSON.stringify(err));
      }

      toast.success("Produto e taxa cadastrados com sucesso!");
      methods.reset();
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  // Verificar se há erros de validação
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      if (methods.formState.errors) {
        console.log("Erros atuais:", methods.formState.errors);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods.watch, methods.formState.errors]);

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-full overflow-y-auto rounded-2xl border bg-white p-6 sm:w-1/2">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Cadastrar Produto: <span className="text-primary">(Novo)</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
              {/* Seção do Produto */}
              <Card className="w-full rounded-2xl border p-8">
                <CardHeader>
                  <CardTitle>Seguimento do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={methods.control}
                    name="convenio_hash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Convênio</FormLabel>
                        <FormControl>
                          <Combobox
                            data={convenio}
                            displayField="nome"
                            value={convenio.find((c) => c.id === field.value) || null}
                            onChange={(selected) => field.onChange(selected?.id || "")}
                            searchFields={["nome"]}
                            placeholder="Selecione um Convênio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="modalidade_hash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade</FormLabel>
                        <FormControl>
                          <Combobox
                            data={modalidade}
                            displayField="nome"
                            value={modalidade.find((m) => m.id === field.value) || null}
                            onChange={(selected) => field.onChange(selected?.id || "")}
                            searchFields={["nome"]}
                            placeholder="Selecione uma Modalidade"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="tipo_operacao_hash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Operação</FormLabel>
                        <FormControl>
                          <Combobox
                            data={produtos}
                            displayField="nome"
                            value={produtos.find((p) => p.id === field.value) || null}
                            onChange={(selected) => field.onChange(selected?.id || "")}
                            searchFields={["nome"]}
                            placeholder="Selecione o Tipo de Operação"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="dias_validade_ccb"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias de Validade da CCB</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full border"
                            type="number"
                            placeholder="Digite a validade em dias"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="inicio"
                      render={({ field }) => (
                        <FormItem className="mt-4 flex flex-col">
                          <FormLabel>Inicio da vigência</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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

                    {/* Data Fim */}
                    <FormField
                      control={methods.control}
                      name="fim"
                      render={({ field }) => (
                        <FormItem className="mt-4 flex flex-col">
                          <FormLabel>Fim da vigência</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                </CardContent>
              </Card>

              {/* Seção da Taxa */}
              <Card>
                <CardHeader>
                  <CardTitle>Condições Comerciais</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Campos de texto mapeados */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {textFields.map((conf) => (
                      <FormField
                        key={conf.name}
                        control={methods.control}
                        name={conf.name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{conf.label}</FormLabel>
                            <FormControl>
                              <Input
                                className="w-full border"
                                placeholder={conf.placeholder}
                                type={(conf as any).type || "text"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <FormField
                      control={methods.control}
                      name="bancalizador"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bancarizador</FormLabel>
                          <FormControl>
                            <Combobox
                              data={bancarizador}
                              displayField="nome"
                              value={bancarizador.find((c) => c.id === field.value) || null}
                              onChange={(selected) => field.onChange(selected?.id || "")}
                              searchFields={["nome"]}
                              placeholder="Selecione"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="seguradora"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seguradora</FormLabel>
                          <FormControl>
                            <Combobox
                              data={seguradora}
                              displayField="nome"
                              value={seguradora.find((m) => m.id === field.value) || null}
                              onChange={(selected) => field.onChange(selected?.id || "")}
                              searchFields={["nome"]}
                              placeholder="Selecione"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="seguro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seguro</FormLabel>
                          <FormControl>
                            <Combobox
                              data={seguro}
                              displayField="nome"
                              value={seguro.find((p) => p.id === field.value) || null}
                              onChange={(selected) => field.onChange(selected?.id || "")}
                              searchFields={["nome"]}
                              placeholder="Selecione"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {prazoFields.map((conf) => (
                        <FormField
                          key={conf.name}
                          control={methods.control}
                          name={conf.name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{conf.label}</FormLabel>
                              <FormControl>
                                <Input
                                  className="w-full border"
                                  placeholder={conf.placeholder}
                                  type={conf.type || "text"}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <FormField
                      control={methods.control}
                      name="incrementador"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Incrementador</FormLabel>
                          <FormControl>
                            <Input
                              className="w-full border"
                              placeholder="Digite o incrementador"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Seção do RO */}
              <Card>
                <CardHeader>
                  <CardTitle>Roteiro Operacional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={methods.control}
                    name="RO"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de RO</FormLabel>
                        <FormControl>
                          <Combobox
                            data={RO}
                            displayField="nome"
                            value={RO.find((p) => p.id === field.value) || null}
                            onChange={(selected) => field.onChange(selected?.id || "")}
                            searchFields={["nome"]}
                            placeholder="Selecione o Tipo de RO"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
