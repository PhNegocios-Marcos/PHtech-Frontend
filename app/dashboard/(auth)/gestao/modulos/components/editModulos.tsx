// Arquivo: ModulosEditForm.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const equipeSchema = z.object({
  id: z.string(),
  nome: z.string().min(5, "Por favor, defina um nome para o módulo."),
  status: z.number()
});

type ModulosFormValues = z.infer<typeof equipeSchema> & {
  nome?: string;
};

type ModulosEditProps = {
  modulos: ModulosFormValues;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function ModulosEditForm({ modulos, onClose }: ModulosEditProps) {
  const methods = useForm<ModulosFormValues>({
    resolver: zodResolver(equipeSchema),
    defaultValues: modulos
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(modulos);
  }, [modulos, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: ModulosFormValues) => {
    try {
      const payload = { ...data };

      await axios.put(`${API_BASE_URL}/modulo/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast.success("Módulo atualizado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.erro || "Erro ao atualizar módulo";

      if (msg === "Nome já cadastrado.") {
        methods.setError("nome", {
          type: "manual",
          message: msg
        });
      }

      console.error("Erro ao atualizar módulo:", error);
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
      onClose();
    };

  return (
    <Sheet open={!!modulos} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-1/3 max-w-full! px-5 rounded-l-xl">
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            Editar módulo: <span className="text-primary">{modulos.nome}</span>
          </SheetTitle>
        </SheetHeader>
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="h-full flex flex-col">
              
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do módulo</FormLabel>
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
                              onChange={(selected) => field.onChange(selected?.id)}
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

              <div className="mb-6 flex flex-col mt-auto justify-end gap-4">
                <Button type="submit" className="py-6">Salvar alterações</Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
