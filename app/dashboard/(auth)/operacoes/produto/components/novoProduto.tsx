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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CalendarBR } from "@/components/ui/calendar-locale";

// Schema de validação combinado
const schema = z
  .object({
    // Dados do produto
    promotora_hash: z.string().min(1, "Promotora é obrigatória"),
    convenio_hash: z.string().min(1, "Convênio é obrigatório"),
    modalidade_hash: z.string().min(1, "Modalidade é obrigatória"),
    tipo_operacao_hash: z.string().min(1, "Tipo de operação é obrigatório"),
    // dias_validade_ccb: z.string().min(1, "Validade da CCB é obrigatório"),
    bancalizador: z.string().min(1, "Bancarizador é obrigatório"),
    seguradora: z.string().min(1, "Seguradora é obrigatória"),
    seguro: z.string().min(1, "Seguro é obrigatório"),
    RO: z.string().min(1, "RO é obrigatório"),
    valor_bruto_minimo: z.string().optional(),
    valor_bruto_maximo: z.string().optional(),
    idade_minima: z.string().optional(),
    idade_maxima: z.string().optional(),

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
  dadosCompletos?: any; // ADICIONE ESTA LINHA
};

// Campos de texto repetidos (para reduzir código)
// Campos de texto repetidos (para reduzir código)
const textFields = [
  { name: "nome_taxa", label: "Apelido do produto", placeholder: "Digite o nome", type: "text" },
  { name: "taxa_mensal", label: "Taxa mensal", placeholder: "1.6", type: "number" },
  { name: "periodiciade", label: "Cálculo de operação", placeholder: "Digite o período da operação", type: "number" }
] as const;

const prazoFields = [
  { name: "prazo_minimo", label: "Prazo mínimo", placeholder: "12", type: "number" },
  { name: "prazo_maximo", label: "Prazo máximo", placeholder: "64", type: "number" }
] as const;

export default function CadastroCompletoModal({ isOpen, onClose }: CadastroCompletoModalProps) {
  const [loading, setLoading] = useState(false);
  const [convenio, setConvenio] = useState<Option[]>([]);
  const [promotora, setPromotora] = useState<Option[]>([]);
  const [modalidade, setModalidade] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);
  const [bancarizador, setBancarizador] = useState<Option[]>([]);
  const [seguro, setSeguro] = useState<Option[]>([]);
  const [seguradora, setSeguradora] = useState<Option[]>([]);
  const [usaSeguro, setaSeguro] = useState(false);
  const [usaTac, setaTac] = useState(false);
  const [roList, setRO] = useState<Array<Option & { dadosCompletos?: any }>>([]);

  // Selects
  const [convenioSelect, setConvenioSelect] = React.useState<Option | null>(null);
  const [modalidadeSelect, setModalidadeSelect] = React.useState<Option | null>(null);
  const [tipoDeOperacaoSelect, setTipoDeOperacaoSelect] = React.useState<Option | null>(null);


  const { token, userData } = useAuth();
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      promotora_hash: "",
      convenio_hash: "",
      modalidade_hash: "",
      tipo_operacao_hash: "",
      // dias_validade_ccb: "",
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
      seguro: "",
      valor_bruto_minimo: "",
      valor_bruto_maximo: "",
      idade_minima: "",
      idade_maxima: ""
    }
  });

  // Modifique o useEffect que busca as promotoras para debug
  // Substitua este useEffect
  useEffect(() => {
    async function fetchPromotoras() {
      try {
        const res = await axios.get(`${API_BASE_URL}/promotora/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.map((pp: any) => ({
          id: pp.id, // Mudança importante aqui
          nome: pp.nome
        }));
        setPromotora(data);
      } catch (error: any) {
        console.error("Erro ao carregar promotoras", error);
        toast.error("Erro ao carregar promotoras: " + (error.message || "Erro desconhecido"));
      }
    }

    if (isOpen && token) {
      fetchPromotoras();
    }
  }, [isOpen, token]);

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
          nome: item.nome,
          dadosCompletos: item // Armazena todos os dados para uso posterior
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

  // Função para preencher automaticamente os campos quando uma RO é selecionada
  const preencherCamposDaRO = (roSelecionada: Option) => {
    if (!roSelecionada?.dadosCompletos) return;

    const dados = roSelecionada.dadosCompletos;

    // Preencher campos principais
    methods.setValue("prazo_minimo", dados.prazo_minimo?.toString() || "");
    methods.setValue("prazo_maximo", dados.prazo_maximo?.toString() || "");

    // Usar taxa mínima como taxa mensal padrão
    methods.setValue("taxa_mensal", dados.taxa_minima?.toString() || "");

    // Preencher campos de valor (se existirem no seu schema)
    methods.setValue("valor_bruto_minimo", dados.valor_bruto_minimo?.toString() || "");
    methods.setValue("valor_bruto_maximo", dados.valor_bruto_maximo?.toString() || "");

    // Preencher campos de idade (se existirem no seu schema)
    methods.setValue("idade_minima", dados.idade_minima?.toString() || "");
    methods.setValue("idade_maxima", dados.idade_maxima?.toString() || "");

    // Configurar checkboxes baseado nos dados da RO
    setaSeguro(dados.usa_seguro === 1);
    setaTac(dados.usa_tac === 1);

    // Mostrar mensagem de sucesso
    toast.success(`Campos preenchidos com os dados da RO: ${roSelecionada.nome}`);
  };

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
          seguro: data.seguro,
          rotina_operacional_hash: data.RO
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log(produtoResponse);

      const relacionamentoId = produtoResponse.data.rel_produto_subproduto_convenio_id;

      await axios.post(
        `${API_BASE_URL}/rel-produto-promotora/criar`,
        {
          produto_hash: relacionamentoId,
          promotora_hash: data.promotora_hash
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Criar relação com rotina operacional
      // await axios.post(
      //   `${API_BASE_URL}/rel-rotina-operacional-prod-convenio/criar`,
      //   {
      //     rotina_operacional_hash: data.RO,
      //     relacionamento_hash: relacionamentoId
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json"
      //     }
      //   }
      // );

      // // Segundo: Criar a taxa com o relacionamento
      // const taxaPayload = {
      //   relacionamento_produto_hash: relacionamentoId,
      //   nome_tabela: data.nome_taxa,
      //   prazo_minimo: data.prazo_minimo,
      //   prazo_maximo: data.prazo_maximo,
      //   taxa_mensal: data.taxa_mensal,
      //   usuario_criacao_hash: (userData as any)?.id ?? "id_user",
      //   incrementador: data.incrementador,
      //   periodicidade: data.periodiciade,
      //   vigencia_inicio: format(data.inicio, "yyyy-MM-dd"),
      //   vigencia_fim: format(data.fim, "yyyy-MM-dd"),
      //   bancarizador: data.bancalizador,
      //   seguradora: data.seguradora,
      //   seguro: data.seguro
      // };

      // console.log("Enviando payload:", taxaPayload);

      // const taxaResponse = await fetch(`${API_BASE_URL}/produtos-config-tabelas/criar`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify(taxaPayload)
      // });

      // if (!taxaResponse.ok) {
      //   const err = await taxaResponse.json();
      //   throw new Error(JSON.stringify(err));
      // }

      toast.success("Produto e taxa cadastrados com sucesso!");
      methods.reset();
      onClose();
      window.location.reload;
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
        // console.log("Erros atuais:", methods.formState.errors);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods.watch, methods.formState.errors]);

  if (!isOpen) return null;

  const handleCheckedTacChange = (checked: any) => {
    setaTac(checked);
  };

  const handleCheckedSegChange = (checked: any) => {
    setaSeguro(checked);
  };



  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-3/5 max-w-full! px-5 rounded-l-xl ">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            Cadastrar produto: <span className="text-primary">(Novo)</span>
          </SheetTitle>
          {/* <SheetDescription className="text-xs font-normal text-gray-500 dark:text-gray-200">
            Versão: 
          </SheetDescription> */}
        </SheetHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col overflow-y-auto">
            <div className="flex-1 space-y-6 px-2">
              {/* Seção do Produto */}
              <Card className="w-full rounded-2xl border p-8 px-1">
                <CardHeader>
                  <CardTitle>Segmento do Produto</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    Determine as regras e segmentação do produto a ser cadastrado
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-5">
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
                              onChange={(selected) => {
                                field.onChange(selected?.id || "");
                                setConvenioSelect(selected || null);
                                setModalidadeSelect(null);
                              }}
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
                              onChange={(selected) => {
                                field.onChange(selected?.id || "")
                                setModalidadeSelect(selected || null);
                              }}
                              searchFields={["nome"]}
                              placeholder="Selecione uma Modalidade"
                              className={!convenioSelect ? "*:bg-gray-200! *:text-gray-400! *:cursor-not-allowed! pointer-events-none" : "pointer-events-auto *:bg-background *:text-black *:dark:text-white cursor-pointer"}
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
                              className={!modalidadeSelect ? "*:bg-gray-200! *:text-gray-400! *:cursor-not-allowed! pointer-events-none" : "pointer-events-auto *:bg-background *:text-black *:dark:text-white cursor-pointer"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* <FormField
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
                  /> */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="inicio"
                      render={({ field }) => (
                        <FormItem className="mt-4 flex flex-col">
                          <FormLabel>Início da vigência</FormLabel>
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
                              <CalendarBR
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
                              <CalendarBR
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

              <Card className="w-full rounded-2xl border p-8 px-1">
                <CardHeader>
                  <CardTitle>Promotora</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    Determine qual a promotora do produto a ser cadastrado
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-5">
                    <FormField
                      control={methods.control}
                      name="promotora_hash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promotora(s)</FormLabel>
                          <FormControl>
                            <Combobox
                              data={promotora}
                              displayField="nome"
                              value={promotora.find((p) => p.id === field.value) || null}
                              onChange={(selected) => field.onChange(selected?.id || "")}
                              searchFields={["nome"]}
                              placeholder="Selecione uma ou mais promotoras"
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
                  <CardTitle>Regra do produto</CardTitle>
                  <p className="dark:text-200 text-sm text-gray-600">
                    Selecione o Roteiro Operacional deste produto.
                  </p>
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
                            data={roList}
                            displayField="nome"
                            value={roList.find((p) => p.id === field.value) || null}
                            onChange={(selected) => {
                              field.onChange(selected?.id || "");
                              if (selected) {
                                preencherCamposDaRO(selected); // ADICIONE ESTA LINHA
                              } else {
                                // Opcional: Limpar campos se nenhuma RO for selecionada
                                methods.setValue("prazo_minimo", "");
                                methods.setValue("prazo_maximo", "");
                                methods.setValue("taxa_mensal", "");
                              }
                            }}
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

              {/* Seção da Taxa */}
              <Card>
                <CardHeader>
                  <CardTitle>Condições comerciais</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    Determine as condições comerciais deste produto respeitando as normas.
                  </p>
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
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
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

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Seguro
                        <Label
                          htmlFor="useSeguro"
                          className="dark:text-200 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                          <Checkbox
                            checked={usaSeguro}
                            onCheckedChange={handleCheckedSegChange}
                            id="useSeguro"
                          />{" "}
                          O produto usa seguro?
                        </Label>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={usaSeguro ? "block" : "hidden"}>
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Taxa de abertura de Crédito - TAC
                        <Label
                          htmlFor="useTac"
                          className="dark:text-200 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                          <Checkbox
                            checked={usaTac}
                            onCheckedChange={handleCheckedTacChange}
                            id="useTac"
                          />{" "}
                          O produto usa TAC?
                        </Label>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={usaTac ? "flex" : "hidden"}>
                      <FormField
                        control={methods.control}
                        name="nome_taxa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selecionar taxa</FormLabel>
                            <FormControl>
                              <Combobox
                                data={seguro}
                                displayField="nome"
                                value={seguro.find((m) => m.id === field.value) || null}
                                onChange={(selected) => field.onChange(selected?.id || "")}
                                searchFields={["nome"]}
                                placeholder="Selecione"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 mb-6 flex flex-col justify-end gap-4 px-4">
              <Button type="submit" className="py-6" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
