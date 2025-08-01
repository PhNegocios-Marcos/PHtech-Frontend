"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipo de dados da Promotora
export type Promotora = {
  id: string;
  nome: string;
  razao_social: string;
  cnpj: string;
  representante: string | null;
  master: string;
  master_id: string;
  rateio_master: string;
  rateio_sub: string;
  status: number;
};

// Props do componente
type PromotorEditProps = {
  data: Promotora;
  onClose: () => void;
};

export function PromotorEdit({ data, onClose }: PromotorEditProps) {
  const methods = useForm({
    defaultValues: data
  });
  const { token } = useAuth();

  useEffect(() => {
    methods.reset(data);
  }, [data, methods]);

  const onSubmit = async (formData: Promotora) => {
    if (!token) {
      console.error("Token global não definido! Autenticação inválida.");
      return;
    }

    const payload = {
      id: formData.id,
      nome: formData.nome,
      representante: formData.representante,
      razao_social: formData.razao_social,
      status: Number(formData.status)
    };

    try {
      await axios.put(`${API_BASE_URL}/promotora/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Promotora atualizada com sucesso!");
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao atualizar promotora:", error.response?.data || error.message);
      alert(`Erro: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  };

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-2 overflow-y-auto">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Dados da Promotora:{" "}
                  <span className="text-primary">{data.nome}</span>
                </CardTitle>
                <Button onClick={onClose} variant="outline">
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 space-y-4">
                <FormField
                  control={methods.control}
                  name="nome"
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
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="cursor-not-allowed bg-gray-100 text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="representante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Representante</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="rateio_master"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rateio Master</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="rateio_sub"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rateio Sub</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Combobox
                          data={statusOptions}
                          displayField="name"
                          value={statusOptions.find((opt) => opt.id === field.value) ?? null}
                          onChange={(selected) => field.onChange(selected.id)}
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

          <div className="col-span-2 flex justify-end p-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
