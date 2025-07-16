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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const convenioSchema = z.object({
  convenio_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  convenio_prefixo: z.number().min(1, "Prefixo é obrigatório"),
  convenio_grupo: z.string(),
  convenio_averbador: z.string(),
  convenio_status: z.number(),
  convenio_hash: z.string().optional()
});

type Convenio = z.infer<typeof convenioSchema>;

type ConvenioDrawerProps = {
  convenio: Convenio;
  onClose: () => void;
  onRefresh: () => void;
};

export function ConvenioEdit({
  convenio,
  onClose,
  onRefresh
}: ConvenioDrawerProps) {
  const methods = useForm<Convenio>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      ...convenio,
      convenio_status: convenio.convenio_status ?? 1
    }
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset({
      ...convenio,
      convenio_status: convenio.convenio_status ?? 1
    });
  }, [convenio, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Convenio) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    const payload = {
      convenio_nome: data.convenio_nome,
      convenio_prefixo: data.convenio_prefixo,
      convenio_grupo: data.convenio_grupo,
      convenio_averbador: data.convenio_averbador,
      convenio_status: data.convenio_status,
      convenio_hash: data.convenio_hash
    };

    try {
      await axios.put(`${API_BASE_URL}/convenio/${data.convenio_hash}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar convênio:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, (errors) => {
          console.warn("Erros de validação:", errors);
        })}
        className="grid grid-cols-2 gap-4 p-6"
      >
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Editar Convênio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control}
                name="convenio_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="convenio_prefixo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefixo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="convenio_grupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="convenio_averbador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Averbador</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="convenio_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Combobox
                        data={statusOptions}
                        displayField="name"
                        value={statusOptions.find(opt => opt.id === field.value) ?? statusOptions[0]}
                        onChange={(selected) => field.onChange(selected?.id ?? 1)}
                        searchFields={["name"]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </FormProvider>
  );
}