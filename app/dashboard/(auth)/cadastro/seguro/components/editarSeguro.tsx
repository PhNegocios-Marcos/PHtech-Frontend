"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const seguroSchema = z.object({
  id: z.string(),
  seguradora_hash: z.string().optional(),
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

type SeguradoraOption = {
  id: string;
  name: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function SeguroEditForm({ seguro, onClose }: SeguroEditProps) {
  const methods = useForm<SeguroFormValues>({
    resolver: zodResolver(seguroSchema),
    defaultValues: seguro
  });

  const { token } = useAuth();
  const [seguradoras, setSeguradoras] = React.useState<SeguradoraOption[]>([]);

  useEffect(() => {
    methods.reset(seguro);
  }, [seguro, methods]);

  useEffect(() => {
    async function fetchSeguradoras() {
      try {
        const response = await fetch(`${API_BASE_URL}/seguradoras/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Erro ao buscar seguradoras");

        const data = await response.json();
        const options = data.map((seguradora: any) => ({
          id: seguradora.hash,
          name: seguradora.nome
        }));
        setSeguradoras(options);
      } catch (error) {
        console.error("Erro ao listar seguradoras:", error);
      }
    }

    fetchSeguradoras();
  }, [token]);

  const onSubmit = async (data: SeguroFormValues) => {
    try {
      const payload: Partial<SeguroFormValues> = { id: data.id };

      if (data.seguradora_hash !== seguro.seguradora_hash)
        payload.seguradora_hash = data.seguradora_hash;
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
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.erro || "Erro ao atualizar faixa de seguro";
      alert(msg);
      console.error("Erro ao atualizar faixa de seguro:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <h2>
                    Editar Faixa de Seguro:{" "}
                    <span className="text-primary">{seguro.seguradora_hash}</span>
                  </h2>
                </CardTitle>
                <Button onClick={onClose} variant="outline">
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={methods.control}
                  name="seguradora_hash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seguradora</FormLabel>
                      <FormControl>
                        <Input {...field} disabled/>
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <FormLabel>Valor da Seguradora</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Valor Pago pelo Cliente</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}
