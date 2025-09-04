"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  seguradora_hash: z.string().min(1, "Seguradora é obrigatória"),
  faixa_inicio: z.string().min(2, "Faixa inicial é obrigatória"),
  faixa_fim: z.string().min(2, "Faixa final é obrigatória"),
  valor_seguradora: z.string().min(1, "Valor da seguradora é obrigatório"),
  valor_pago_cliente: z.string().min(1, "Valor pago pelo cliente é obrigatório")
});

type FormData = z.infer<typeof schema>;

type CadastroSeguroModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
};

type SeguradoraOption = {
  value: string;
  label: string;
  seguradora_hash: string;
};

export default function CadastroSeguroModal({ isOpen, onClose, onRefresh }: CadastroSeguroModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      seguradora_hash: "",
      faixa_inicio: "",
      faixa_fim: "",
      valor_seguradora: "",
      valor_pago_cliente: ""
    }
  });

  const { token } = useAuth();
  const [seguradoras, setSeguradoras] = useState<SeguradoraOption[]>([]);
  const [selectedSeguradora, setSelectedSeguradora] = useState<SeguradoraOption | null>(null);

  useEffect(() => {
    if (!token || !isOpen) return;

    async function fetchSeguradoras() {
      try {
        const response = await fetch(`${API_BASE_URL}/seguradoras/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) throw new Error("Erro ao buscar seguradoras");

        const data = await response.json();
        
        const options = data.map((seguradora: any) => ({
          value: seguradora.seguradora_hash,
          label: seguradora.nome,
          seguradora_hash: seguradora.seguradora_hash
        }));
        
        setSeguradoras(options);
      } catch (error) {
        console.error("Erro ao listar seguradoras:", error);
        toast.error("Erro ao listar seguradoras");
      }
    }

    fetchSeguradoras();
  }, [token, isOpen]);

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

  const handleSeguradoraChange = (item: SeguradoraOption) => {
    setSelectedSeguradora(item);
    methods.setValue("seguradora_hash", item.seguradora_hash);
  };

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/seguro-faixas/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao cadastrar");
      }

      toast.success("Faixa de seguro cadastrada com sucesso!");
      methods.reset();
      setSelectedSeguradora(null);
      onRefresh?.();
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar faixa de seguro:", error);
      toast.error(error.message || "Erro ao cadastrar faixa de seguro");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-background p-6 shadow-lg rounded-l-2xl">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar nova faixa de seguro</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados da Faixa de Seguro</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={methods.control}
                      name="seguradora_hash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seguradora</FormLabel>
                          <FormControl>
                            <Combobox
                              data={seguradoras}
                              displayField="label"
                              value={selectedSeguradora}
                              onChange={handleSeguradoraChange}
                              searchFields={["label"]}
                              placeholder="Selecione uma seguradora"
                            />
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
                              placeholder="Digite a faixa inicial" 
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
                              placeholder="Digite a faixa final" 
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
                              placeholder="Digite o valor da seguradora" 
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
                              placeholder="Digite o valor pago pelo cliente" 
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

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Faixa de Seguro</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}