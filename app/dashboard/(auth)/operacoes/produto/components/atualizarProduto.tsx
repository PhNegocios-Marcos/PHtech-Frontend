"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "./Combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MultiSelect, type MultiSelectOption } from "@/components/multi-select";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CalendarBR } from "@/components/ui/calendar-locale";

// Schema de validação (igual ao de criação)
const schema = z
  .object({
    // Dados do produto
    promotora_hash: z.array(z.string()).min(1, "Pelo menos uma promotora é obrigatória"),
    // convenio_hash: z.string().min(1, "Convênio é obrigatório"),
    // modalidade_hash: z.string().min(1, "Modalidade é obrigatória"),
    // tipo_operacao_hash: z.string().min(1, "Tipo de operação é obrigatório"),
    // bancalizador: z.string().min(1, "Bancarizador é obrigatório"),
    // seguradora: z.string().min(1, "Seguradora é obrigatória"),
    // seguro: z.string().min(1, "Seguro é obrigatório"),
    // RO: z.string().min(1, "RO é obrigatório"),
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

type Option = {
  id?: string | number;
  nome: string | number;
  hash?: string | number;
  name?: string | number;
  status?: number;
  dadosCompletos?: any;
};

type AtualizarProdutoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  produto: any;
  onUpdate: () => void;
};

// Campos de texto repetidos
const textFields = [
  { name: "nome_taxa", label: "Nome do produto", placeholder: "Digite o nome", type: "text" },
  { name: "taxa_mensal", label: "Taxa mensal", placeholder: "1.6", type: "number" },
  {
    name: "periodiciade",
    label: "Cálculo de operação",
    placeholder: "Digite o período da operação",
    type: "number"
  }
] as const;

const prazoFields = [
  { name: "prazo_minimo", label: "Prazo mínimo", placeholder: "12", type: "number" },
  { name: "prazo_maximo", label: "Prazo máximo", placeholder: "64", type: "number" }
] as const;

export default function AtualizarProdutoModal({
  isOpen,
  onClose,
  produto,
  onUpdate
}: AtualizarProdutoModalProps) {
  const [loading, setLoading] = useState(false);
  const [convenio, setConvenio] = useState<Option[]>([]);
  const [promotora, setPromotora] = useState<Option[]>([]);
  const [modalidade, setModalidade] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);
  const [bancarizador, setBancarizador] = useState<Option[]>([]);
  const [seguro, setSeguro] = useState<Option[]>([]);
  const [seguradora, setSeguradora] = useState<Option[]>([]);
  const [roList, setRO] = useState<Option[]>([]);
  const [usaSeguro, setaSeguro] = useState(false);
  const [usaTac, setaTac] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const { token, userData } = useAuth();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      promotora_hash: [],
      // convenio_hash: "",
      // modalidade_hash: "",
      // tipo_operacao_hash: "",
      nome_taxa: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodiciade: "",
      inicio: undefined,
      fim: undefined,
      // RO: "",
      // bancalizador: "",
      // seguradora: "",
      // seguro: "",
      valor_bruto_minimo: "",
      valor_bruto_maximo: "",
      idade_minima: "",
      idade_maxima: ""
    }
  });

  // Preencher o formulário com os dados do produto
  useEffect(() => {
    if (isOpen && produto) {
      methods.reset({
        promotora_hash: produto.promotora_hash ? [produto.promotora_hash] : [],
        // convenio_hash: produto.convenio_hash || "",
        // modalidade_hash: produto.modalidade_hash || "",
        // tipo_operacao_hash: produto.tipo_operacao_hash || "",
        nome_taxa: produto.nome_tabela || "",
        prazo_minimo: produto.prazo_minimo?.toString() || "",
        prazo_maximo: produto.prazo_maximo?.toString() || "",
        taxa_mensal: produto.taxa_mensal?.toString() || "",
        incrementador: produto.incrementador || "",
        periodiciade: produto.periodicidade?.toString() || "",
        inicio: produto.vigencia_inicio ? new Date(produto.vigencia_inicio) : undefined,
        fim: produto.vigencia_fim ? new Date(produto.vigencia_fim) : undefined,
        // RO: produto.rotina_operacional_hash || "",
        // bancalizador: produto.bancarizador || "",
        // seguradora: produto.seguradora || "",
        // seguro: produto.seguro || "",
        valor_bruto_minimo: produto.valor_bruto_minimo?.toString() || "",
        valor_bruto_maximo: produto.valor_bruto_maximo?.toString() || "",
        idade_minima: produto.idade_minima?.toString() || "",
        idade_maxima: produto.idade_maxima?.toString() || ""
      });

      setaSeguro(produto.usa_seguro === 1);
      setaTac(produto.usa_tac === 1);
    }
  }, [isOpen, produto, methods]);

  // Carregar dados para os comboboxes
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !token) return;

      try {
        // Carregar convênios
        // const convenioRes = await axios.get(`${API_BASE_URL}/convenio`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setConvenio(
        //   convenioRes.data.map((c: any) => ({ id: c.convenio_hash, nome: c.convenio_nome }))
        // );

        // // Carregar promotoras
        const promotoraRes = await axios.get(`${API_BASE_URL}/promotora/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPromotora(promotoraRes.data.map((pp: any) => ({ id: pp.id, nome: pp.nome })));

        // // Carregar modalidades
        // const modalidadeRes = await axios.get(`${API_BASE_URL}/produtos/listar`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setModalidade(modalidadeRes.data.map((item: any) => ({ id: item.id, nome: item.nome })));

        // // Carregar produtos (tipos de operação)
        // const produtosRes = await axios.get(`${API_BASE_URL}/subprodutos/listar`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setProdutos(
        //   produtosRes.data.map((item: any) => ({
        //     id: item.produtos_subprodutos_id,
        //     nome: item.produtos_subprodutos_nome
        //   }))
        // );

        // Carregar RO
        const roRes = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRO(
          roRes.data.map((item: any) => ({
            id: item.rotina_operacional_hash,
            nome: item.nome,
            dadosCompletos: item
          }))
        );

        // Carregar bancarizadores
        const bancarizadorRes = await axios.get(`${API_BASE_URL}/bancarizador/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBancarizador(
          bancarizadorRes.data.map((item: any) => {
            const uuid = Object.keys(item)[0];
            return { id: uuid, nome: item[uuid].nome };
          })
        );

        // Carregar seguradoras
        const seguradoraRes = await axios.get(`${API_BASE_URL}/seguradoras/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeguradora(
          seguradoraRes.data.map((item: any) => ({
            id: item.seguradora_hash,
            nome: item.nome
          }))
        );

        // Carregar seguros
        const seguroRes = await axios.get(`${API_BASE_URL}/seguro-faixas/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeguro(
          seguroRes.data.map((item: any) => ({
            id: item.seguro_faixa_hash,
            nome: item.nome
          }))
        );
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados: " + (error.message || "Erro desconhecido"));
      }
    };

    fetchData();
  }, [isOpen, token]);



  // Função para atualizar o produto
  const onSubmit = async (data: FormData) => {
    console.log("Dados do formulário:", data); // Debug
    setLoading(true);

    try {
      const promotoraHash = data.promotora_hash.length > 0 ? data.promotora_hash[0] : "";

      const payload = {
        config_tabela_hash: produto.tabela_hash,
        relacionamento_hash: produto.relacionamento_hash,
        // convenio_hash: data.convenio_hash,
        // modalidade_hash: data.modalidade_hash,
        // tipo_operacao_hash: data.tipo_operacao_hash,
        nome_tabela: data.nome_taxa,
        prazo_minimo: data.prazo_minimo,
        prazo_maximo: data.prazo_maximo,
        taxa_mensal: data.taxa_mensal,
        usuario_atualizacao_hash: (userData as any)?.id ?? "id_user",
        incrementador: data.incrementador,
        periodicidade: data.periodiciade,
        vigencia_inicio: format(data.inicio, "yyyy-MM-dd"),
        vigencia_fim: format(data.fim, "yyyy-MM-dd"),
        // bancarizador: data.bancalizador,
        // seguradora: data.seguradora,
        // seguro: data.seguro,
        // rotina_operacional_hash: data.RO,
        valor_bruto_minimo: data.valor_bruto_minimo,
        valor_bruto_maximo: data.valor_bruto_maximo,
        idade_minima: data.idade_minima,
        idade_maxima: data.idade_maxima,
        usa_seguro: usaSeguro ? 1 : 0,
        usa_tac: usaTac ? 1 : 0,
        promotora_hash: promotoraHash
      };

      console.log("Payload:", payload); // Debug

      const response = await axios.put(
        `${API_BASE_URL}/produtos-config-tabelas/atualizar-completo`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Resposta da API:", response.data); // Debug

      // Atualizar também a relação com promotora se necessário
      if (data.promotora_hash && produto.relacionamento_hash) {
        await axios.put(
          `${API_BASE_URL}/rel-produto-promotora/atualizar`,
          {
            relacionamento_hash: produto.relacionamento_hash,
            promotora_hash: data.promotora_hash
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      toast.success("Produto atualizado com sucesso!");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      const errorMessage =
        error.response?.data?.detail || error.response?.data?.message || error.message;
      toast.error(`Erro ao atualizar: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Adicione esta função para debug
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário submetido manualmente");
    methods.handleSubmit(onSubmit)();
  };

  if (!isOpen) return null;

  const handleCheckedTacChange = (checked: any) => {
    setaTac(checked);
  };

  const handleCheckedSegChange = (checked: any) => {
    setaSeguro(checked);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-3/5 max-w-full! rounded-l-xl px-5">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            Editar produto: <span className="text-primary">{produto.nome}</span>
          </SheetTitle>
        </SheetHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex h-full flex-col overflow-y-auto">
            <div className="flex-1 space-y-6 px-2">
              {/* Seção do Produto */}
              <Card className="w-full rounded-2xl border p-8 px-1">
                <CardHeader>
                  <CardTitle>Segmento do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={methods.control}
                    name="promotora_hash"
                    render={({ field }) => {
                      const promotoraOptions: MultiSelectOption[] = promotora.map((p) => ({
                        label: String(p.nome),
                        value: String(p.id || p.hash || "")
                      }));

                      return (
                        <FormItem>
                          <FormLabel>Promotora(s)</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={promotoraOptions}
                              onValueChange={field.onChange} // Já é array
                              defaultValue={field.value}
                              placeholder="Selecione as promotoras..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </CardContent>
              </Card>

              {/* Seção do RO */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Regra do produto</CardTitle>
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
              </Card> */}

              {/* Seção da Taxa */}
              <Card>
                <CardHeader>
                  <CardTitle>Condições Comerciais</CardTitle>
                </CardHeader>
                <CardContent>
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
                    {/* <FormField
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
                    /> */}

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

                  {/* <Card className="mt-6">
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
                  </Card> */}

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
              <Button
                type="submit"
                className="py-6"
                disabled={loading}
                onClick={() => console.log("Botão clicado")}>
                {loading ? "Atualizando..." : "Atualizar produto"}
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
