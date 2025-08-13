"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { THEMES } from "@/lib/themes";
import { useThemeConfig } from "@/components/active-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;

const masterOptions = [
  { id: "1", name: "Sim" },
  { id: "0", name: "Não" }
];

const usaParadaOptions = [
  { id: "1", nome: "Sim" },
  { id: "0", nome: "Não" }
];

const schema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    razao_social: z.string().min(1, "Razão social é obrigatória"),
    cnpj: z.string().regex(cnpjRegex, "CNPJ inválido"),
    master: z.enum(["0", "1"]),
    usa_parada: z.enum(["0", "1"]),
    radius: z.string().optional(),
    master_id: z.string().uuid().optional(),
    rateio_master: z.number().min(0).max(100),
    rateio_sub: z.number().min(0).max(100).optional(),
    file: z.any().optional()
  })
  .refine(
    (data) => {
      if (data.master === "0") {
        return !!data.master_id && data.rateio_master + (data.rateio_sub ?? 0) === 100;
      }
      if (data.master === "1") {
        return data.rateio_master === 100;
      }
      return false;
    },
    {
      message: "Rateios devem somar 100 e master_id é obrigatório para sub-promotora",
      path: ["rateio_master", "rateio_sub", "master_id"]
    }
  );

type FormData = z.infer<typeof schema>;

type CadastroPromotoraModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroPromotoraModal({ isOpen, onClose }: CadastroPromotoraModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      razao_social: "",
      cnpj: "",
      master: "1",
      usa_parada: "0",
      rateio_master: 100,
      rateio_sub: 0,
      master_id: undefined,
      radius: "md"
    }
  });

  const { token } = useAuth();
  const router = useRouter();
  const masterValue = methods.watch("master");

  const [files, setFiles] = useState<any[]>([]);
  const [master, setMaster] = useState<any[]>([]);
  const { theme } = useThemeConfig();
  const [selectedPreset, setSelectedPreset] = useState(theme.preset);

  const onDrop = (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setFiles((prev) => [...prev, ...imageFiles].slice(0, 5));
  };

  const { getInputProps, open: openFileDialog } = useDropzone({
    onDrop,
    noClick: true,
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  function handlePreset(value: any) {
    setSelectedPreset(value);
  }

  useEffect(() => {
    async function fetchMasters() {
      try {
        const res = await axios.get(`${API_BASE_URL}/promotora/listar`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((c: any) => ({ id: c.id, nome: c.nome }));
        setMaster(data);
      } catch (error) {
        console.error("Erro ao carregar masters", error);
        toast.error("Erro ao carregar lista de promotoras master", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    }
    fetchMasters();
  }, [token]);

  if (!isOpen) return null;

  async function onSubmit(data: FormData) {
    if (!token) {
      toast.error("Token de autenticação não encontrado. Faça login.", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("razao_social", data.razao_social);
      formData.append("cnpj", data.cnpj.replace(/\D/g, ""));
      formData.append("master", data.master);
      formData.append("usa_parada", data.usa_parada);
      formData.append("rateio_master", data.rateio_master.toString());

      if (data.master === "0") {
        formData.append("rateio_sub", (data.rateio_sub ?? 0).toString());
        formData.append("master_id", data.master_id ?? "");
      }

      formData.append("tema[preset]", theme.preset);
      formData.append("tema[radius]", theme.radius);
      formData.append("tema[scale]", theme.scale);
      formData.append("tema[contentLayout]", theme.contentLayout);

      if (files.length > 0 && files[0].file) {
        formData.append("tema[image]", files[0].file);
      }

      await axios.post(`${API_BASE_URL}/promotora/criar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Promotora cadastrada com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      onClose();
      router.push("/dashboard/default");
    } catch (error: any) {
      console.error("Erro ao cadastrar promotora:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    }
  }

  // Campos fixos
  const formFields = [
    { name: "nome", label: "Nome", placeholder: "Digite o nome" },
    { name: "razao_social", label: "Razão Social", placeholder: "Digite a razão social" },
    {
      name: "cnpj",
      label: "CNPJ",
      placeholder: "00.000.000/0000-00",
      maxLength: 18,
      format: (val: string) =>
        val
          .replace(/\D/g, "")
          .replace(/^(\d{2})(\d)/, "$1.$2")
          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/\.(\d{3})(\d)/, ".$1/$2")
          .replace(/(\d{4})(\d)/, "$1-$2")
          .slice(0, 18)
    },
    {
      name: "rateio_master",
      label: "Rateio Master (%)",
      type: "number",
      min: 0,
      max: 100,
      step: 0.01
    },
    {
      name: "usa_parada",
      label: "Usa Parada",
      component: (field: any) => (
        <Combobox
          data={usaParadaOptions}
          displayField="nome"
          value={usaParadaOptions.find((item) => item.id === field.value) ?? null}
          onChange={(selected) => field.onChange(selected?.id ?? "0")}
          placeholder="Selecione"
        />
      )
    }
  ];

  // Campos condicionais (aparece só se master === "0")
  const conditionalFields = [
    {
      name: "master_id",
      label: "Master ID (UUID)",
      component: (field: any) => (
        <Combobox
          data={master}
          displayField="nome"
          value={master.find((item) => item.id === field.value) ?? null}
          onChange={(selected) => field.onChange(selected?.id)}
          searchFields={["nome"]}
          placeholder="Selecione uma promotora"
        />
      ),
      showIf: () => masterValue === "0"
    },
    {
      name: "rateio_sub",
      label: "Rateio Sub (%)",
      component: (field: any) => (
        <Input
          type="number"
          step="0.01"
          min={0}
          max={100}
          {...field}
          onChange={(e) => field.onChange(Number(e.target.value))}
        />
      ),
      showIf: () => masterValue === "0"
    }
  ];

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Nova Promotora</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados da Promotora</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Campos fixos */}
                    {formFields.map(
                      ({
                        name,
                        label,
                        placeholder,
                        type,
                        min,
                        max,
                        step,
                        maxLength,
                        format,
                        component
                      }) => (
                        <FormField
                          key={name}
                          control={methods.control}
                          name={name as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl>
                                {component ? (
                                  component(field)
                                ) : (
                                  <Input
                                    type={type || "text"}
                                    placeholder={placeholder}
                                    min={min}
                                    max={max}
                                    step={step}
                                    maxLength={maxLength}
                                    {...field}
                                    onChange={(e) => {
                                      let value = e.target.value;
                                      if (format) value = format(value);
                                      field.onChange(type === "number" ? Number(value) : value);
                                    }}
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    )}

                    {/* Campo master */}
                    <FormField
                      control={methods.control}
                      name="master"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>É Master?</FormLabel>
                          <FormControl>
                            <Combobox
                              data={masterOptions}
                              displayField="name"
                              value={masterOptions.find((opt) => opt.id === field.value) ?? null}
                              onChange={(selected) => field.onChange(selected.id)}
                              searchFields={["name"]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campos condicionais */}
                    {conditionalFields
                      .filter((f) => f.showIf())
                      .map(({ name, label, component }) => (
                        <FormField
                          key={name}
                          control={methods.control}
                          name={name as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl>{component(field)}</FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}

                    {/* Seletor de tema */}
                    <div className="flex flex-col gap-4">
                      <Label>Theme preset:</Label>
                      <Select value={selectedPreset} onValueChange={handlePreset}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {THEMES.map((theme) => (
                            <SelectItem key={theme.name} value={theme.value}>
                              <div className="flex shrink-0 gap-1">
                                {theme.colors.map((color, key) => (
                                  <span
                                    key={key}
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Upload de imagens */}
                  <div className="mt-6">
                    <CardTitle>Imagens</CardTitle>
                    <div className="border-input relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors">
                      <input {...getInputProps()} className="sr-only" />
                      {files.length > 0 ? (
                        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="bg-accent relative aspect-square rounded-md border">
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="size-full rounded-[inherit] object-cover"
                              />
                              <Button
                                type="button"
                                onClick={() => removeFile(file.id)}
                                size="icon"
                                className="absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none">
                                <XIcon className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="bg-background mb-2 flex size-11 items-center justify-center rounded-full border">
                            <ImageIcon className="size-4 opacity-60" />
                          </div>
                          <p className="mb-1.5 text-sm font-medium">Solte imagens aqui</p>
                          <p className="text-muted-foreground text-xs">PNG ou JPG (max. 5MB)</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={openFileDialog}>
                            <UploadIcon className="-ms-1 opacity-60" />
                            Selecionar imagens
                          </Button>
                        </div>
                      )}
                    </div>
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
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}

CadastroPromotoraModal.displayName = "CadastroPromotoraModal";