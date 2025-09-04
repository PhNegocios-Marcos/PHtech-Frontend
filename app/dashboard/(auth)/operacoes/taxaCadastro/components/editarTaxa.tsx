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
  cad_tac_valor_minimo: z
    .number()
    .min(1, "Valor mínimo é obrigatório. Valor mínimo não pode ser negativo"),
  cad_tac_valor_maximo: z
    .number()
    .min(1, "Valor máximo é obrigatório. Valor máximo não pode ser negativo"),
  cad_tac_valor_cobrado: z
    .number()
    .min(1, "Valor cobrado é obrigatório. Valor cobrado não pode ser negativo")
});

const putTaxaSchema = z.object({
  id: z.number(),
  valor_minimo: z.number().min(1, "Valor mínimo é obrigatório. Valor mínimo não pode ser negativo"),
  valor_maximo: z.number().min(1, "Valor máximo é obrigatório. Valor máximo não pode ser negativo"),
  valor_cobrado: z
    .number()
    .min(1, "Valor cobrado é obrigatório. Valor cobrado não pode ser negativo")
});

type TaxaFormValues = z.infer<typeof taxaSchema>;
type TaxaFormValuePUT = z.infer<typeof putTaxaSchema>;

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
      const body: TaxaFormValues[] = [data];

      if (data.cad_tac_valor_minimo !== taxa.cad_tac_valor_minimo)
        payload.cad_tac_valor_minimo = data.cad_tac_valor_minimo;
      if (data.cad_tac_valor_maximo !== taxa.cad_tac_valor_maximo)
        payload.cad_tac_valor_maximo = data.cad_tac_valor_maximo;
      if (data.cad_tac_valor_cobrado !== taxa.cad_tac_valor_cobrado)
        payload.cad_tac_valor_cobrado = data.cad_tac_valor_cobrado;

      const removePrefixOfData = (data: TaxaFormValues[]): TaxaFormValuePUT | null => {
        if (!data.length) return null;

        const obj = data[0];

        return {
          id: obj.cad_tac_id,
          valor_cobrado: obj.cad_tac_valor_cobrado,
          valor_maximo: obj.cad_tac_valor_maximo,
          valor_minimo: obj.cad_tac_valor_minimo
        };
      };

      const dataOutPrefix = removePrefixOfData(body);

      await axios.put(`${API_BASE_URL}/faixa-valor-cobrado/atualizar`, dataOutPrefix, {
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
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 mb-0 bg-black/50"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 z-50 h-full w-full overflow-auto rounded-l-2xl p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <Form {...methods}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Editar faixa de taxa: <span className="text-primary">{taxa.cad_tac_id}</span>
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
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="cad_tac_valor_minimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mínimo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : 0;
                                field.onChange(val);
                              }}
                              placeholder="Digite o valor cobrado"
                            />
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
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : 0;
                                field.onChange(val);
                              }}
                              placeholder="Digite o valor cobrado"
                            />
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
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : 0;
                                field.onChange(val);
                              }}
                              placeholder="Digite o valor cobrado"
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
