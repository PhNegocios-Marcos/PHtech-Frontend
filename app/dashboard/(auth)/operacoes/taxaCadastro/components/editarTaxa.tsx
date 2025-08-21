"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";

const taxaSchema = z.object({
  id: z.number(),
  valor_minimo: z.string().min(1, "Valor mínimo é obrigatório"),
  valor_maximo: z.string().min(1, "Valor máximo é obrigatório"),
  valor_cobrado: z.string().min(1, "Valor cobrado é obrigatório")
});

type TaxaFormValues = z.infer<typeof taxaSchema>;

type TaxaEditProps = {
  taxa: TaxaFormValues;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function TaxaEditForm({ taxa, onClose }: TaxaEditProps) {
  const methods = useForm<TaxaFormValues>({
    resolver: zodResolver(taxaSchema),
    defaultValues: taxa
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(taxa);
  }, [taxa, methods]);

  const onSubmit = async (data: TaxaFormValues) => {
    try {
      const payload: Partial<TaxaFormValues> = { id: data.id };

      if (data.valor_minimo !== taxa.valor_minimo)
        payload.valor_minimo = data.valor_minimo;
      if (data.valor_maximo !== taxa.valor_maximo)
        payload.valor_maximo = data.valor_maximo;
      if (data.valor_cobrado !== taxa.valor_cobrado)
        payload.valor_cobrado = data.valor_cobrado;

      await axios.put(`${API_BASE_URL}/faixa-valor-cobrado/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast.success("Faixa de taxa atualizada com sucesso!");
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.erro || "Erro ao atualizar faixa de taxa";
      toast.error(msg);
      console.error("Erro ao atualizar faixa de taxa:", error);
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
                    Editar Faixa de Taxa: <span className="text-primary">{taxa.id}</span>
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
                  name="valor_minimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mínimo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="valor_maximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Máximo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="valor_cobrado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Cobrado</FormLabel>
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
