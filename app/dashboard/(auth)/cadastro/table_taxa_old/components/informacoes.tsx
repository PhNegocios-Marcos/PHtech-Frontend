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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  nome_tabela: z.string().min(1, "Nome da tabela é obrigatório"),
  prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
  taxa_mensal: z.string().min(1, "Taxa mensal é obrigatório"),
  incrementador: z.string().min(1, "Incrementador é obrigatório"),
  periodiciade: z.string().min(1, "Periodicidade é obrigatória"),
  tabela_hash: z.string().optional(),
  inicio: z.date().optional(),
  fim: z.date().optional()
});

type Subproduto = z.infer<typeof schema>;

type SubprodutoDrawerProps = {
  subproduto: Partial<Subproduto>;
  onClose: () => void;
  onRefresh: () => void;
};

export function SubprodutoEdit({ subproduto, onClose, onRefresh }: SubprodutoDrawerProps) {
  const router = useRouter();
  const { token, userData } = useAuth();

  const methods = useForm<Subproduto>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_tabela: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodiciade: "",
      tabela_hash: "",
      inicio: undefined,
      fim: undefined
    }
  });

    useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
        // console.log("token null");
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  useEffect(() => {
    methods.reset({
      ...subproduto,
      inicio: subproduto.inicio ? parseISO(subproduto.inicio.toString()) : undefined,
      fim: subproduto.fim ? parseISO(subproduto.fim.toString()) : undefined
    });
  }, [subproduto, methods]);

  const statusOptions = [{ id: "PERSONALIZADO", name: "PERSONALIZADO" }];

  const onSubmit = async (data: Subproduto) => {
    if (!token) {
      console.error("Token global não definido!");
      toast.error("Token de autenticação não encontrado.", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }

    const payload = {
      nome_tabela: data.nome_tabela,
      config_tabela_hash: data.tabela_hash,
      prazo_minimo: data.prazo_minimo,
      prazo_maximo: data.prazo_maximo,
      taxa_mensal: data.taxa_mensal,
      usuario_atualizacao: (userData as any)?.id ?? "id_user",
      incrementador: data.incrementador,
      periodicidade: data.periodiciade,
      vigencia_inicio: format(data.inicio ?? new Date(), "yyyy-MM-dd"),
      vigencia_fim: format(data.fim ?? new Date(), "yyyy-MM-dd")
    };

    try {
      await axios.put(`${API_BASE_URL}/produtos-config-tabelas/atualizar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Subproduto atualizado com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar subproduto:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 p-6"
      >
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Editar Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control}
                name="nome_tabela"
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
                name="prazo_minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo mínimo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="prazo_maximo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo máximo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="64" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="taxa_mensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa mensal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1.6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="incrementador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incrementador</FormLabel>
                    <FormControl>
                      <Combobox
                        data={statusOptions}
                        displayField="name"
                        value={statusOptions.find((opt) => opt.id === field.value) ?? null}
                        onChange={(selected) => field.onChange(selected?.id ?? "")}
                        searchFields={["name"]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="periodiciade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidade</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="inicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Início da vigência</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Selecione uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="fim"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fim da vigência</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Selecione uma data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
