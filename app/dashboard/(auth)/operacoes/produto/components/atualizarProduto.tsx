"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Combobox } from "./Combobox";


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

// Schema de validação
const schema = z.object({
  nome_tabela: z.string().optional(),
  prazo_minimo: z.string().optional(),
  prazo_maximo: z.string().optional(),
  taxa_mensal: z.string().optional(),
  incrementador: z.string().optional(),
  periodicidade: z.string().optional(),
  vigencia_inicio: z.date({ required_error: "Data de início é obrigatória" }),
  vigencia_fim: z.date({ required_error: "Data de fim é obrigatória" })
});

type FormData = z.infer<typeof schema>;

type AtualizarProdutoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  produto: any;
  onUpdate: () => void;
};

export default function AtualizarProdutoModal({
  isOpen,
  onClose,
  produto,
  onUpdate
}: AtualizarProdutoModalProps) {
  const [loading, setLoading] = useState(false);
  const { token, userData } = useAuth();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_tabela: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodicidade: "",
      vigencia_inicio: undefined,
      vigencia_fim: undefined
    }
  });

  // Preencher o formulário com os dados do produto quando a modal abrir
  useEffect(() => {
    if (isOpen && produto) {
      methods.reset({
        nome_tabela: produto.nome_tabela || "",
        prazo_minimo: produto.prazo_minimo?.toString() || "",
        prazo_maximo: produto.prazo_maximo?.toString() || "",
        taxa_mensal: produto.taxa_mensal?.toString() || "",
        incrementador: produto.incrementador || "",
        periodicidade: produto.periodicidade?.toString() || "",
        vigencia_inicio: produto.vigencia_inicio ? new Date(produto.vigencia_inicio) : undefined,
        vigencia_fim: produto.vigencia_fim ? new Date(produto.vigencia_fim) : undefined
      });
    }
  }, [isOpen, produto, methods]);

  // Função para atualizar a taxa
  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const payload = {
        config_tabela_hash: produto.tabela_hash,
        vigencia_fim: format(data.vigencia_fim, "yyyy-MM-dd"),
      };

      await axios.put(`${API_BASE_URL}/produtos-config-tabelas/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast.success("Taxa atualizada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });

      onUpdate(); // Atualizar a lista de produtos
      onClose(); // Fechar a modal
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      toast.error(`Erro ao atualizar: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
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
        className="fixed top-0 right-0 z-50 h-full w-full overflow-y-auto bg-background p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Editar Taxa</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
              {/* Seção da Taxa */}
              <Card>
                <CardHeader>
                  <CardTitle>Tabela Taxa</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Nome da Tabela (somente leitura) */}
                  <FormField
                    control={methods.control}
                    name="nome_tabela"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Tabela</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome"
                            {...field}
                            disabled // Campo não editável conforme solicitado
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prazo Mínimo */}
                  <FormField
                    control={methods.control}
                    name="prazo_minimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo mínimo</FormLabel>
                        <FormControl>
                          <Input placeholder="12" {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prazo Máximo */}
                  <FormField
                    control={methods.control}
                    name="prazo_maximo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo máximo</FormLabel>
                        <FormControl>
                          <Input placeholder="64" {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Taxa Mensal */}
                  <FormField
                    control={methods.control}
                    name="taxa_mensal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa mensal</FormLabel>
                        <FormControl>
                          <Input placeholder="1.6" {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Incrementador */}
                  <FormField
                    control={methods.control}
                    name="incrementador"
                    render={({ field }) => (
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
                                value={{ id: controllerField.value, name: controllerField.value }}
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

                  {/* Periodicidade */}
                  <FormField
                    control={methods.control}
                    name="periodicidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidade</FormLabel>
                        <FormControl>
                          <Input placeholder="12" {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data Início */}
                  <FormField
                    control={methods.control}
                    name="vigencia_inicio"
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
                    name="vigencia_fim"
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
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar Taxa"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
