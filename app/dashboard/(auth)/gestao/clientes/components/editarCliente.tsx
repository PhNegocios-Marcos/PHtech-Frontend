"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  cpf: z.string().min(11, "CPF é obrigatório").max(11, "CPF deve ter 11 dígitos"),
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  status: z.number().min(0).max(1),
});

type FormData = z.infer<typeof schema>;

export default function EditarCliente({
  cliente,
  onClose,
  onRefresh,
}: {
  cliente: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { token, userData } = useAuth();
  const [loading, setLoading] = React.useState(false);

  // Função para converter a string de data para Date de forma segura
  const parseDateSafe = (dateString: string): Date | null => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  };

  const defaultDate = parseDateSafe(cliente.data_nascimento) || new Date();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cpf: cliente.cpf,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      data_nascimento: defaultDate,
      status: cliente.status,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        data_nascimento: format(data.data_nascimento, "yyyy-MM-dd"),
        usuario_atualizacao: userData?.id || "system",
      };

      await axios.put(`${API_BASE_URL}/cliente/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Cliente atualizado com sucesso!");
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error(`Erro ao atualizar cliente: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="CPF" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="E-mail" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_nascimento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value && isValid(field.value) ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="1">Ativo</option>
                      <option value="0">Inativo</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Voltar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}