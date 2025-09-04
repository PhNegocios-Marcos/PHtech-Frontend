"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form
} from "@/components/ui/form";
import { toast } from "sonner";

const seguroSchema = z.object({
  seguro_faixa_hash: z.string(),
  nome: z.string().optional(),
  faixa_inicio: z.string().min(1, "Faixa inicial é obrigatória"),
  faixa_fim: z.string().min(1, "Faixa final é obrigatória"),
  valor_seguradora: z.string().min(1, "Valor da seguradora é obrigatório"),
  valor_pago_cliente: z.string().min(1, "Valor pago pelo cliente é obrigatório")
});

type SeguroFormValues = z.infer<typeof seguroSchema>;

type SeguroEditProps = {
  seguro: SeguroFormValues;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function SeguroEditForm({ seguro, onClose }: SeguroEditProps) {
  const router = useRouter();
  const methods = useForm<SeguroFormValues>({
    // resolver: zodResolver(seguroSchema),
    defaultValues: seguro
  });

  const { token } = useAuth();

  // Função para evitar números negativos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    // Permite apenas números positivos ou vazio
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      field.onChange(value);
    }
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: string): string => {
    if (!value) return "";
    
    // Remove tudo que não é número ou ponto decimal
    let cleaned = value.replace(/[^\d.]/g, '');
    
    // Permite apenas um ponto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limita a 2 casas decimais após o ponto
    if (parts.length === 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return cleaned;
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const formattedValue = formatCurrency(e.target.value);
    field.onChange(formattedValue);
  };

  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      console.log("📋 Form values:", value);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  useEffect(() => {
    console.log("🔍 Erros do formulário:", methods.formState.errors);
  }, [methods.formState.errors]);

  // ADICIONE ESTE HANDLE SUBMIT SIMPLES
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ Botão submit clicado!");
    console.log("📊 Form values:", methods.getValues());
  };

  useEffect(() => {
    methods.reset(seguro);
  }, [seguro, methods]);

    useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
        // console.log("token null");
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  const onSubmit = async (data: SeguroFormValues) => {

    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    try {
      const payload: Partial<SeguroFormValues> = { seguro_faixa_hash: data.seguro_faixa_hash };

      if (data.nome !== seguro.nome) payload.nome = data.nome;
      if (data.faixa_inicio !== seguro.faixa_inicio) payload.faixa_inicio = data.faixa_inicio;
      if (data.faixa_fim !== seguro.faixa_fim) payload.faixa_fim = data.faixa_fim;
      if (data.valor_seguradora !== seguro.valor_seguradora)
        payload.valor_seguradora = data.valor_seguradora;
      if (data.valor_pago_cliente !== seguro.valor_pago_cliente)
        payload.valor_pago_cliente = data.valor_pago_cliente;

      await axios.put(`${API_BASE_URL}/seguro-faixas/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast.success("Seguro atualizado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      const msg = error?.response?.data?.erro || "Erro ao atualizar faixa de seguro";
      toast.error(msg, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  const handleClose = () => {
    toast.info("Edição cancelada", {
      style: {
        background: "var(--toast-info)",
        color: "var(--toast-info-foreground)",
        boxShadow: "var(--toast-shadow)"
      }
    });
    onClose?.();
  };

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 z-40 bg-black/50 mb-0" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 z-50 h-full w-full overflow-auto p-6 shadow-lg md:w-1/2 rounded-l-2xl">
        <FormProvider {...methods}>
          <Form {...methods}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Faixa de Seguro: <span className="text-primary">{seguro.nome}</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("✅ Submit direto");
                const data = methods.getValues();
                onSubmit(data);
              }}
              className="space-y-4">
              <Card className="col-span-2">
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seguradora</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="faixa_inicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faixa Inicial</FormLabel>
                          <FormControl>
                            <Input 
                              value={field.value || ""}
                              onChange={(e) => handleNumberChange(e, field)}
                              min="0"
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="faixa_fim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faixa Final</FormLabel>
                          <FormControl>
                            <Input 
                              value={field.value || ""}
                              onChange={(e) => handleNumberChange(e, field)}
                              min="0"
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="valor_seguradora"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da Seguradora (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              value={field.value || ""}
                              onChange={(e) => handleCurrencyChange(e, field)}
                              min="0"
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="valor_pago_cliente"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Pago pelo Cliente (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              value={field.value || ""}
                              onChange={(e) => handleCurrencyChange(e, field)}
                              min="0"
                              type="text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}