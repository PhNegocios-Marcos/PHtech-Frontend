"use client";

import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import Cleave from "cleave.js/react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import { Combobox } from "./Combobox";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
import { X } from "lucide-react";

const telefoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, "");

  const penultimoNum = parseInt(cpf[cpf.length - 2]);
  const ultimoNum = parseInt(cpf[cpf.length - 1]);

  let somaPrimeiroDigito = 0;
  for (let i = 0; i < 9; i++) {
    const digito = parseInt(cpf[i]);
    const peso = 10 - i;
    somaPrimeiroDigito += digito * peso;
  }

  const restoPrimeiro = somaPrimeiroDigito % 11;
  const primeiroDigito = restoPrimeiro < 2 ? 0 : 11 - restoPrimeiro;

  let somaSegundoDigito = 0;
  for (let i = 0; i < 9; i++) {
    const digito = parseInt(cpf[i]);
    const peso = 11 - i;
    somaSegundoDigito += digito * peso;
  }
  somaSegundoDigito += primeiroDigito * 2;

  const restoSegundo = somaSegundoDigito % 11;
  const segundoDigito = restoSegundo < 2 ? 0 : 11 - restoSegundo;

  if (primeiroDigito !== penultimoNum || segundoDigito !== ultimoNum) {
    return false;
  } else {
    return true;
  }
}

// Schema para endereço
const enderecoSchema = z.object({
  cep: z.string().min(8, "Por favor, digite um CEP válido"),
  logradouro: z.string().min(1, "Por favor, digite um logradouro válido"),
  numero: z.string().min(1, "Por favor, digite o número corretamente."),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Por favor, digite o bairro."),
  cidade: z.string().min(1, "Por favor, defina a cidade"),
  estado: z.string().min(1, "Por favor, nos diga o estado"),
  uf: z.string().min(2, "Por favor, digite o UF corretamente").max(2, "UF deve ter 2 caracteres")
});

const schema = z
  .object({
    nome: z.string().min(4, "Por favor, digite um nome"),
    cpf: z
      .string()
      .min(11, "Por favor, digite o CPF corretamente")
      .refine((val) => validarCPF(val), {
        message: "CPF inválido, tente novamente"
      }),
    email: z.string().email("Email inválido, tente novamente"),
    telefone: z.string().regex(telefoneRegex, "Telefone inválido, tente novamente"),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caractere"),
    confirmar_senha: z.string().min(6, "A confirmação deve ter ao menos 6 caracteres"),
    tipo_acesso: z.enum(["externo", "interno"]),
    promotora: z.string().min(1, "Por favor, selecione a promotora"),
    usa_2fa: z.enum(["0", "1"]),
    enderecos: z.array(enderecoSchema).min(1, "Cadastre ao menos um endereço")
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: "Senha incorreta, tente novamente ",
    path: ["confirmar_senha"]
  });

type Promotora = {
  id: string;
  nome: string;
};

type FormData = z.infer<typeof schema>;

type CadastroUsuarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Campos de endereço para o formulário
const enderecoFields = [
  { name: "enderecos.0.cep", label: "CEP", type: "text", required: true },
  { name: "enderecos.0.logradouro", label: "Logradouro", type: "text", required: true },
  { name: "enderecos.0.numero", label: "Número", type: "text", required: true },
  { name: "enderecos.0.bairro", label: "Bairro", type: "text", required: true },
  { name: "enderecos.0.cidade", label: "Cidade", type: "text", required: true },
  { name: "enderecos.0.estado", label: "Estado", type: "text", required: true },
  { name: "enderecos.0.uf", label: "UF", type: "text", required: true }
];

// Componente para formulário de endereço
const EnderecoForm = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: any[] }
>(({ formData, onChange, fields }, ref) => {
  const e = formData.enderecos[0] || {};

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    fields.forEach((field: any) => {
      const fieldName = field.name.startsWith("enderecos.0.")
        ? field.name.split(".").slice(2).join(".")
        : field.name;
      if (field.required) {
        schemaObj[fieldName] = z.string().min(1, `${field.label} é obrigatório`);
      } else {
        schemaObj[fieldName] = z.string().optional();
      }
    });
    return z.object(schemaObj);
  };

  const localSchema = createSchema();
  type EnderecoFormData = z.infer<typeof localSchema>;

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<EnderecoFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: fields.reduce(
      (acc: Record<string, any>, field: any) => {
        const fieldName = field.name.startsWith("enderecos.0.")
          ? field.name.split(".").slice(2).join(".")
          : field.name;
        acc[fieldName] = e[fieldName] || "";
        return acc;
      },
      {} as Record<string, any>
    )
  });

  useEffect(() => {
    fields.forEach((field: any) => {
      const fieldName = field.name.startsWith("enderecos.0.")
        ? field.name.split(".").slice(2).join(".")
        : field.name;
      setValue(fieldName, e[fieldName] || "");
    });
  }, [formData, setValue, fields]);

  useImperativeHandle(ref, () => ({
    validate: () => trigger()
  }));

  const formatCep = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return cleaned;
  };

  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        return;
      }

      const campos = {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.localidade || "",
        uf: data.uf || ""
      };

      Object.entries(campos).forEach(([key, val]) => {
        setValue(key as keyof EnderecoFormData, val);
        onChange(`enderecos.0.${key}`, val);
      });

      toast.success("Endereço encontrado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("Não foi possível buscar o endereço. Verifique sua conexão.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  const renderField = (field: any) => {
    const fieldName = field.name.startsWith("enderecos.0.")
      ? field.name.split(".").slice(2).join(".")
      : field.name;
    const errorMessage = errors[fieldName]?.message;
    const isErrorString = typeof errorMessage === "string";

    // Garante que o valor do input é sempre string
    const value =
      field.name === "enderecos.0.numero"
        ? e["numero"] !== undefined
          ? String(e["numero"])
          : ""
        : e[fieldName] || "";

    return (
      <div key={field.name} className="grid gap-1">
        <span>{field.label}</span>
        {field.name === "enderecos.0.cep" ? (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            value={e["cep"] || ""}
            onChange={(e) => {
              const rawValue = e.target.value;
              const formattedValue = formatCep(rawValue);
              setValue(fieldName, formattedValue);
              onChange(field.name, formattedValue);
              if (formattedValue.replace(/\D/g, "").length === 8) {
                buscarEndereco(formattedValue);
              }
            }}
            className=""
          />
        ) : field.name === "enderecos.0.numero" ? (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(fieldName, e.target.value);
              onChange(field.name, e.target.value);
            }}
            className=""
          />
        ) : (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            type={field.type}
            value={e[fieldName] || ""}
            onChange={(e) => {
              const value = e.target.value;
              setValue(fieldName, value);
              onChange(field.name, value);
            }}
            className=""
          />
        )}
        {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    );
  };

  return (
    <div className="mt-4">
      <h3 className="mb-4 text-lg font-medium">Endereço</h3>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map(renderField)}
        <div className="grid gap-1">
          <span>Complemento</span>
          <Input
            placeholder="Complemento"
            value={e.complemento || ""}
            onChange={(ev) => {
              onChange("enderecos.0.complemento", ev.target.value);
            }}
            className=""
          />
        </div>
      </div>
    </div>
  );
});

EnderecoForm.displayName = "EnderecoForm";

export default function CadastroUsuarioModal({ isOpen, onClose }: CadastroUsuarioModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_acesso: "externo",
      cpf: "",
      telefone: "",
      email: "",
      nome: "",
      senha: "",
      confirmar_senha: "",
      promotora: "",
      usa_2fa: "0",
      enderecos: [
        {
          cep: "",
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          uf: ""
        }
      ]
    }
  });

  const [promotoras, setPromotoras] = useState<Promotora[]>([]);
  const [promotoraSelecionada, setPromotoraSelecionada] = useState<Promotora | null>(null);
  const { token } = useAuth();
  const router = useRouter();
  const podeCriar = useHasPermission("Tipo_de_Acesso_criar");
  const enderecoFormRef = React.useRef<{ validate: () => Promise<boolean> }>(null);

  useEffect(() => {
    async function fetchPromotoras() {
      try {
        const response = await fetch(`${API_BASE_URL}/promotora/listar`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPromotoras(data.map((p: any) => ({ id: p.id, nome: p.nome })));
        }
      } catch (err) {
        // erro silencioso
      }
    }
    if (isOpen) fetchPromotoras();
  }, [isOpen, token]);

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

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado. Faça login.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          border: "1px solid var(--toast-border)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    // Validar endereço antes de enviar
    if (enderecoFormRef.current) {
      const isValid = await enderecoFormRef.current.validate();
      if (!isValid) {
        toast.error("Por favor, corrija os erros no endereço", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            border: "1px solid var(--toast-border)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        return;
      }
    }

    const payload = {
      nome: data.nome,
      cpf: data.cpf.replace(/\D/g, ""),
      email: data.email,
      telefone: data.telefone.replace(/\D/g, ""),
      senha: data.senha,
      confirmar_senha: data.confirmar_senha,
      tipo_acesso: data.tipo_acesso,
      promotora: data.promotora,
      usa_2fa: data.usa_2fa,
      enderecos: data.enderecos.map((endereco) => ({
        ...endereco,
        cep: endereco.cep.replace(/\D/g, "")
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/usuario/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erro ao cadastrar usuário");
      }

      toast.success("Usuário cadastrado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          border: "1px solid var(--toast-border)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      toast.error(`Erro ao cadastrar usuário: ${error.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          border: "1px solid var(--toast-border)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-background p-6 shadow-lg rounded-l-2xl">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar novo usuário</h2>
                <X onClick={onClose} className="cursor-pointer"/>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados do usuário</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Cleave
                              {...field}
                              options={{
                                delimiters: [".", ".", "-"],
                                blocks: [3, 3, 3, 2],
                                numericOnly: true
                              }}
                              className="w-full rounded-lg border px-3 py-1"
                              placeholder="000.000.000-00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="exemplo@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Cleave
                              {...field}
                              options={{
                                delimiters: ["(", ") ", "-"],
                                blocks: [0, 2, 5, 4],
                                numericOnly: true
                              }}
                              placeholder="(00) 00000-0000"
                              className="w-full rounded-lg border px-3 py-1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="confirmar_senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirmar senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {podeCriar && (
                      <FormField
                        control={methods.control}
                        name="promotora"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Atribuir Promotora</FormLabel>
                            <Combobox
                              data={promotoras}
                              displayField="nome"
                              value={promotoras.find((p) => p.id === field.value) || null}
                              onChange={(item) => {
                                field.onChange(item.id);
                                setPromotoraSelecionada(item);
                              }}
                              placeholder="Selecione a promotora"
                              label={undefined}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {podeCriar && (
                        <FormField
                          control={methods.control}
                          name="tipo_acesso"
                          render={({ field }) => (
                            <FormItem className="flex flex-col justify-center items-center">
                              <FormLabel>Tipo de Acesso</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="externo">Promotora</SelectItem>
                                  <SelectItem value="interno">Banco</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={methods.control}
                        name="usa_2fa"
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-center items-center">
                            <FormLabel>Usa 2FA?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Sim</SelectItem>
                                <SelectItem value="0">Não</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seção de Endereço */}
                  <EnderecoForm
                    ref={enderecoFormRef}
                    formData={methods.watch()}
                    onChange={(path, value) => methods.setValue(path as any, value)}
                    fields={enderecoFields}
                  />
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
