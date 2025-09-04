"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  PersonIcon,
  AvatarIcon,
  CheckCircledIcon,
  CircleIcon
} from "@radix-ui/react-icons";

// Definição do schema com Zod
const formSchema = z.object({
  esteira_nome: z.string().min(1, { message: "Nome da esteira é obrigatório" }),
  acoes: z.array(
    z.object({
      processo_hash: z.string().min(1, { message: "Processo é obrigatório" }),
      esteira_acao_status_atual: z.string().min(1, { message: "Status atual é obrigatório" }),
      esteira_acao_status_aprova: z.string().nullable(),
      esteira_acao_status_reprova: z.string().nullable(),
      esteira_acao_status_pendencia: z.string().nullable(),
      esteira_acao_atuacao_alcada: z.string().min(1, { message: "Alçada é obrigatória" }),
      esteira_acao_paradinha: z.number().default(0),
      esteira_acao_reinicio: z.number().default(0),
      esteira_acao_edita_cadastro: z.number().default(0),
      esteira_acao_anexa_arquivo: z.number().default(0),
      esteira_acao_resolve_pendencia: z.number().default(0),
      esteira_acao_notifica_cadastro: z.number().default(0)
    })
  )
});

type FormData = z.infer<typeof formSchema>;

type ActionField =
  | "processo_hash"
  | "esteira_acao_status_atual"
  | "esteira_acao_status_aprova"
  | "esteira_acao_status_reprova"
  | "esteira_acao_status_pendencia"
  | "esteira_acao_atuacao_alcada"
  | "esteira_acao_paradinha"
  | "esteira_acao_reinicio"
  | "esteira_acao_edita_cadastro"
  | "esteira_acao_anexa_arquivo"
  | "esteira_acao_resolve_pendencia"
  | "esteira_acao_notifica_cadastro";

interface Status {
  status_hash: string;
  status_nome: string;
  status_cor: string;
  status_tipo: string;
  etapa_hash: string;
  status_status: number;
}

interface Processo {
  processo_hash: string;
  processo_nome: string;
}

interface Alcada {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
}

export default function CadastroEsteira({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { token, userData } = useAuth();
  const router = useRouter();
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [processosList, setProcessosList] = useState<Processo[]>([]);
  const [alcadasList, setAlcadasList] = useState<Alcada[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<{ [key: number]: string[] }>(
    {}
  );

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      esteira_nome: "",
      acoes: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "acoes"
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statusRes, processosRes, alcadasRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/esteira-status/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/esteira-processo/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/alcada/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setStatusList(statusRes.data);
        setProcessosList(processosRes.data);
        setAlcadasList(alcadasRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    try {
      // Criar a esteira primeiro
      const esteiraPayload = {
        esteira_nome: data.esteira_nome,
        esteira_usuario_criacao: userData.id
      };

      const esteiraResponse = await fetch(`${API_BASE_URL}/esteira/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(esteiraPayload)
      });

      if (!esteiraResponse.ok) {
        const err = await esteiraResponse.json();
        throw new Error(JSON.stringify(err));
      }

      const esteiraData = await esteiraResponse.json();
      const esteira_id = esteiraData.esteira_id;

      // Agora criar as ações
      for (const acao of data.acoes) {
        const acaoPayload = {
          ...acao,
          esteira_hash: esteira_id
        };

        const acaoResponse = await fetch(`${API_BASE_URL}/esteira-acao/criar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(acaoPayload)
        });

        if (!acaoResponse.ok) {
          const err = await acaoResponse.json();
          throw new Error(JSON.stringify(err));
        }
      }

      toast.success("Esteira e ações cadastradas com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error(`Erro ao cadastrar: ${error instanceof Error ? error.message : String(error)}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  const handleNotificationToggle = (index: number, notificationType: string) => {
    setSelectedNotifications((prev) => ({
      ...prev,
      [index]: prev[index]?.includes(notificationType)
        ? prev[index].filter((item) => item !== notificationType)
        : [...(prev[index] || []), notificationType]
    }));

    if (notificationType === "cadastro") {
      methods.setValue(
        `acoes.${index}.esteira_acao_notifica_cadastro`,
        selectedNotifications[index]?.includes("cadastro") ? 0 : 1
      );
    }
  };

  const handleCheckboxChange = (index: number, field: ActionField, checked: boolean) => {
    methods.setValue(`acoes.${index}.${field}`, checked ? 1 : 0);
  };

  const StatusCombobox = ({
    value,
    placeholder,
    field,
    index,
    onValueChange
  }: {
    value: string;
    placeholder: string;
    field: ActionField;
    index: number;
    onValueChange: (index: number, field: ActionField, newValue: string) => void;
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between">
            {value
              ? statusList.find((status) => status.status_hash === value)?.status_nome ||
                placeholder
              : placeholder}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar status..." className="h-9" />
            <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
            <CommandGroup>
              {statusList.map((status) => (
                <CommandItem
                  key={status.status_hash}
                  value={status.status_hash}
                  onSelect={() => {
                    onValueChange(index, field, status.status_hash);
                    setOpen(false);
                  }}>
                  {status.status_nome}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === status.status_hash ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const AlcadaCombobox = ({
    value,
    onValueChange,
    index
  }: {
    value: string;
    onValueChange: (index: number, newValue: string) => void;
    index: number;
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between">
            {value !== undefined
              ? alcadasList.find((alcada) => alcada.valor.toString() === value)?.nome ||
                "Selecione uma alçada"
              : "Selecione uma alçada"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar alçada..." className="h-9" />
            <CommandEmpty>Nenhuma alçada encontrada.</CommandEmpty>
            <CommandGroup>
              {alcadasList.map((alcada) => (
                <CommandItem
                  key={alcada.id}
                  value={alcada.valor.toString()}
                  onSelect={() => {
                    onValueChange(index, alcada.valor.toString());
                    setOpen(false);
                  }}>
                  {alcada.nome}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === alcada.valor.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const onValueChange = (index: number, field: ActionField, newValue: string) => {
    methods.setValue(`acoes.${index}.${field}`, newValue);
  };

  if (!isOpen) return null;

  if (loading) return <div>Carregando dados...</div>;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto rounded-l-2xl p-6 shadow-lg">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cadastrar Nova Esteira</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>

            <Card className="flex-grow overflow-auto">
              <CardHeader>
                <CardTitle>Dados da Esteira</CardTitle>
              </CardHeader>

              <CardContent>
                <FormField
                  control={methods.control}
                  name="esteira_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Esteira</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da esteira" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6">
                  <h3 className="text-lg font-semibold">Ações</h3>
                  {fields.map((field, index) => (
                    <Card key={field.id} className="mt-4 border-3 border-solid p-4 shadow-lg">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Ação {index + 1}</h4>
                        <Button variant="destructive" onClick={() => remove(index)}>
                          Remover
                        </Button>
                      </div>

                      <FormField
                        control={methods.control}
                        name={`acoes.${index}.processo_hash`}
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>Processo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um processo" />
                              </SelectTrigger>
                              <SelectContent>
                                {processosList.map((processo) => (
                                  <SelectItem
                                    key={processo.processo_hash}
                                    value={processo.processo_hash}>
                                    {processo.processo_nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <FormItem>
                          <FormLabel>Atual</FormLabel>
                          <FormControl>
                            <StatusCombobox
                              value={methods.watch(`acoes.${index}.esteira_acao_status_atual`)}
                              placeholder="Selecione um status"
                              field="esteira_acao_status_atual"
                              index={index}
                              onValueChange={onValueChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>

                        <FormItem>
                          <FormLabel>Aprovação</FormLabel>
                          <FormControl>
                            <StatusCombobox
                              value={
                                methods.watch(`acoes.${index}.esteira_acao_status_aprova`) || ""
                              }
                              placeholder="Nenhum"
                              field="esteira_acao_status_aprova"
                              index={index}
                              onValueChange={onValueChange}
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Reprovação</FormLabel>
                          <FormControl>
                            <StatusCombobox
                              value={
                                methods.watch(`acoes.${index}.esteira_acao_status_reprova`) || ""
                              }
                              placeholder="Nenhum"
                              field="esteira_acao_status_reprova"
                              index={index}
                              onValueChange={onValueChange}
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Pendência</FormLabel>
                          <FormControl>
                            <StatusCombobox
                              value={
                                methods.watch(`acoes.${index}.esteira_acao_status_pendencia`) || ""
                              }
                              placeholder="Nenhum"
                              field="esteira_acao_status_pendencia"
                              index={index}
                              onValueChange={onValueChange}
                            />
                          </FormControl>
                        </FormItem>
                      </div>

                      <FormField
                        control={methods.control}
                        name={`acoes.${index}.esteira_acao_atuacao_alcada`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Alçada de Atuação</FormLabel>
                            <FormControl>
                              <AlcadaCombobox
                                value={field.value}
                                onValueChange={(index, newValue) => {
                                  methods.setValue(
                                    `acoes.${index}.esteira_acao_atuacao_alcada`,
                                    newValue
                                  );
                                }}
                                index={index}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              Configurações Avançadas
                              <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="text-md mb-2 font-semibold">
                                  Opções de Notificação
                                </h4>
                                <div className="flex flex-col space-y-2">
                                  {[
                                    {
                                      key: "cadastro",
                                      label: "Cadastro PEN",
                                      icons: [EnvelopeOpenIcon, EnvelopeClosedIcon]
                                    },
                                    {
                                      key: "responsavel",
                                      label: "Responsável",
                                      icons: [PersonIcon, AvatarIcon]
                                    },
                                    {
                                      key: "aprovar",
                                      label: "Aprovar",
                                      icons: [CheckCircledIcon, CircleIcon]
                                    }
                                  ].map(({ key, label, icons: [ActiveIcon, InactiveIcon] }) => (
                                    <Button
                                      key={key}
                                      variant="outline"
                                      className={`flex items-center space-x-2 ${selectedNotifications[index]?.includes(key) ? "bg-red-500 text-white" : ""}`}
                                      onClick={() => handleNotificationToggle(index, key)}>
                                      {selectedNotifications[index]?.includes(key) ? (
                                        <ActiveIcon className="h-4 w-4" />
                                      ) : (
                                        <InactiveIcon className="h-4 w-4" />
                                      )}
                                      <span>{label}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-md mb-2 font-semibold">Ações Disponíveis</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {[
                                    { field: "esteira_acao_paradinha", label: "Paradinha" },
                                    { field: "esteira_acao_reinicio", label: "Reinício" },
                                    {
                                      field: "esteira_acao_edita_cadastro",
                                      label: "Edita Cadastro"
                                    },
                                    { field: "esteira_acao_anexa_arquivo", label: "Anexa Arquivo" },
                                    {
                                      field: "esteira_acao_resolve_pendencia",
                                      label: "Resolve Pendência"
                                    }
                                  ].map(({ field, label }) => (
                                    <div key={field} className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={
                                          methods.watch(
                                            `acoes.${index}.${field as ActionField}`
                                          ) === 1
                                        }
                                        onCheckedChange={(checked) =>
                                          handleCheckboxChange(
                                            index,
                                            field as ActionField,
                                            checked as boolean
                                          )
                                        }
                                      />
                                      <Label>{label}</Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      append({
                        processo_hash: "",
                        esteira_acao_status_atual: "",
                        esteira_acao_status_aprova: null,
                        esteira_acao_status_reprova: null,
                        esteira_acao_status_pendencia: null,
                        esteira_acao_atuacao_alcada: "",
                        esteira_acao_paradinha: 0,
                        esteira_acao_reinicio: 0,
                        esteira_acao_edita_cadastro: 0,
                        esteira_acao_anexa_arquivo: 0,
                        esteira_acao_resolve_pendencia: 0,
                        esteira_acao_notifica_cadastro: 0
                      })
                    }>
                    Adicionar Ação
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>
        </FormProvider>
      </aside>
    </>
  );
}
