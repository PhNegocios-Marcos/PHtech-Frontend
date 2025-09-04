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
  cad_tac_id: z.number(),
  cad_tac_valor_minimo: z.string().min(1, "Valor mínimo é obrigatório"),
  cad_tac_valor_maximo: z.string().min(1, "Valor máximo é obrigatório"),
  cad_tac_valor_cobrado: z.string().min(1, "Valor cobrado é obrigatório")
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
    console.log("id: ", data.cad_tac_id);
    try {
      // monta payload com id obrigatório
      const payload: any = { id: data.cad_tac_id };

      if (data.cad_tac_valor_minimo !== taxa.cad_tac_valor_minimo) {
        payload.cad_tac_valor_minimo = data.cad_tac_valor_minimo;
      }
      if (data.cad_tac_valor_maximo !== taxa.cad_tac_valor_maximo) {
        payload.cad_tac_valor_maximo = data.cad_tac_valor_maximo;
      }
      if (data.cad_tac_valor_cobrado !== taxa.cad_tac_valor_cobrado) {
        payload.cad_tac_valor_cobrado = data.cad_tac_valor_cobrado;
      }

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
                    Editar Faixa de Taxa: <span className="text-primary">{taxa.cad_tac_id}</span>
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
                  name="cad_tac_valor_minimo"
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
                  name="cad_tac_valor_maximo"
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
                  name="cad_tac_valor_cobrado"
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
                <Button type="submit">Salvar alterações</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}
