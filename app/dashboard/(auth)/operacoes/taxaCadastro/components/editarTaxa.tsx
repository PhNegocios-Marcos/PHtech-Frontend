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
    try {
      const payload: Partial<TaxaFormValues> = { cad_tac_id: data.cad_tac_id };

      if (data.cad_tac_valor_minimo !== taxa.cad_tac_valor_minimo)
        payload.cad_tac_valor_minimo = data.cad_tac_valor_minimo;
      if (data.cad_tac_valor_maximo !== taxa.cad_tac_valor_maximo)
        payload.cad_tac_valor_maximo = data.cad_tac_valor_maximo;
      if (data.cad_tac_valor_cobrado !== taxa.cad_tac_valor_cobrado)
        payload.cad_tac_valor_cobrado = data.cad_tac_valor_cobrado;

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
      <div onClick={handleClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-full overflow-auto bg-white p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <Form {...methods}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Faixa de Taxa: <span className="text-primary">{taxa.cad_tac_id}</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle></CardTitle>
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
                </CardContent>
              </Card>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
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
