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
const schema = z.object({
  // Dados do produto
  convenio_hash: z.string().min(1, "Convênio é obrigatório"),
  modalidade_hash: z.string().min(1, "Modalidade é obrigatória"),
  tipo_operacao_hash: z.string().min(1, "Tipo de operação é obrigatório"),
  RO: z.string().min(1, "RO é obrigatório"),
  // Dados da taxa
  nome_taxa: z.string().min(1, "Nome da tabela é obrigatório"),
  prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
  taxa_mensal: z.string().min(1, "Taxa mensal é obrigatória"),
  incrementador: z.string().min(1, "Incrementador é obrigatório"),
  periodiciade: z.string().min(1, "Periodicidade é obrigatória"),
  inicio: z.date({ required_error: "Data de início é obrigatória" }),
  fim: z.date({ required_error: "Data de fim é obrigatória" })
});

type FormData = z.infer<typeof schema>;

type CadastroCompletoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Option = {
  id?: string;
  nome: string;
  hash?: string;
  name?: string;
};

// Campos de texto repetidos (para reduzir código)
const textFields = [
  { name: "nome_taxa", label: "Nome Tabela", placeholder: "Digite o nome" },
  { name: "prazo_minimo", label: "Prazo mínimo", placeholder: "12" },
  { name: "prazo_maximo", label: "Prazo máximo", placeholder: "64" },
  { name: "taxa_mensal", label: "Taxa mensal", placeholder: "1.6" },
  { name: "periodiciade", label: "Periodicidade", placeholder: "12" }
] as const;

export default function CadastroCompletoModal({ isOpen, onClose }: CadastroCompletoModalProps) {
  const [loading, setLoading] = useState(false);
  const [convenio, setConvenio] = useState<Option[]>([]);
  const [modalidade, setModalidade] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);
  const [RO, setRO] = useState<Option[]>([]);

  const { token, userData } = useAuth();
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      convenio_hash: "",
      modalidade_hash: "",
      tipo_operacao_hash: "",
      nome_taxa: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodiciade: "",
      inicio: undefined,
      fim: undefined,
      RO: ""
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

  // Função para salvar tudo de uma vez
  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Primeiro: Criar o relacionamento do produto
      const produtoResponse = await axios.post(
        `${API_BASE_URL}/rel-produto-sub-produto-convenio/criar`,
        {
          convenio_hash: data.convenio_hash,
          modalidade_hash: data.modalidade_hash,
          tipo_operacao_hash: data.tipo_operacao_hash
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
          rotina_operacional_hash: data.RO, // agora pega do campo certo
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
        vigencia_fim: format(data.fim, "yyyy-MM-dd")
      };

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

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-full overflow-y-auto bg-white p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cadastrar Produto e Taxa</h2>
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
              <Card>
                <CardHeader>
                  <CardTitle>Produto</CardTitle>
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
                </CardContent>
              </Card>

              {/* Seção da Taxa */}
              <Card>
                <CardHeader>
                  <CardTitle>Tabela Taxa</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Campos de texto mapeados */}
                  {textFields.map((conf) => (
                    <FormField
                      key={conf.name}
                      control={methods.control}
                      name={conf.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{conf.label}</FormLabel>
                          <FormControl>
                            <Input placeholder={conf.placeholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {/* Incrementador */}
                  <FormField
                    control={methods.control}
                    name="incrementador"
                    render={() => (
                      <FormItem>
                        <FormLabel>Incrementador</FormLabel>
                        <FormControl>
                          <Controller
                            name="incrementador"
                            control={methods.control}
                            render={({ field: controllerField }) => (
                              <Combobox
                                data={[{ id: "PERSONALIZADO", name: "PERSONALIZADO" }]}
                                displayField="name"
                                value={{
                                  id: controllerField.value,
                                  name: controllerField.value
                                }}
                                onChange={(selected) =>
                                  controllerField.onChange(selected?.id || "")
                                }
                                searchFields={["name"]}
                                placeholder="Selecione o incrementador"
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data Início */}
                  <FormField
                    control={methods.control}
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
                      <FormItem className="flex flex-col">
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
                {loading ? "Cadastrando..." : "Cadastrar Produto e Taxa"}

              </Button>
            </div>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
