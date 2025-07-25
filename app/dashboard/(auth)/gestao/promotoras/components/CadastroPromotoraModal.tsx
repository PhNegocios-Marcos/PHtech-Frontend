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
import { ThemeCustomizerPanel } from "../theme-customizer";
import { DEFAULT_THEME, THEMES } from "@/lib/themes";
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
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;

const masterOptions = [
  { id: "1", name: "Sim" },
  { id: "0", name: "Não" }
];

const schema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    razao_social: z.string().min(1, "Razão social é obrigatória"),
    cnpj: z.string().regex(cnpjRegex, "CNPJ inválido"),
    master: z.enum(["0", "1"]),
    radius: z.string().optional(),
    master_id: z.string().uuid().optional(),
    rateio_master: z
      .number({
        required_error: "Rateio Master é obrigatório",
        invalid_type_error: "Rateio Master deve ser número"
      })
      .min(0)
      .max(100),
    rateio_sub: z
      .number({
        required_error: "Rateio Sub é obrigatório",
        invalid_type_error: "Rateio Sub deve ser número"
      })
      .min(0)
      .max(100)
      .optional(),
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
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [master, setMaster] = useState<any[]>([]);
  const [masterSelecionado, setMasterSelecionado] = useState<any | null>(null);

  const { theme, setTheme } = useThemeConfig();

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

  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const [selectedPreset, setSelectedPreset] = useState(theme.preset); // tema selecionado, mas não aplicado

  function handlePreset(value: any) {
    setSelectedPreset(value); // salva o valor sem aplicar
  }

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/promotora/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.map((c: any) => ({
          id: c.id,
          nome: c.nome
        }));

        console.log("data: ", data);
        setMaster(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchConvenios();
  }, [token]);

  if (!isOpen) return null;

  async function onSubmit(data: FormData) {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    const payload = {
      nome: data.nome,
      razao_social: data.razao_social,
      cnpj: Number(data.cnpj.replace(/\D/g, "")),
      master: Number(data.master),
      rateio_master: data.rateio_master,
      ...(data.master === "0" && {
        master_id: masterSelecionado?.id,
        rateio_sub: data.rateio_sub
      })
    };

    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("razao_social", data.razao_social);
      formData.append("cnpj", data.cnpj.replace(/\D/g, ""));
      formData.append("master", data.master);
      formData.append("rateio_master", data.rateio_master.toString());

      if (data.master === "0") {
        formData.append("rateio_sub", (data.rateio_sub ?? 0).toString());
        formData.append("master_id", data.master_id ?? "");
      }

      // Adiciona os campos do tema
      formData.append("tema[preset]", theme.preset);
      formData.append("tema[radius]", theme.radius);
      formData.append("tema[scale]", theme.scale);
      formData.append("tema[contentLayout]", theme.contentLayout);

      // Adiciona a imagem (se houver)
      if (files.length > 0 && files[0].file) {
        formData.append("tema[image]", files[0].file);
      }

      await axios.post(`${API_BASE_URL}/promotora/criar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Promotora cadastrada com sucesso!");
      onClose();
      router.push("/dashboard/default");
    } catch (error: any) {
      console.error("Erro ao cadastrar promotora:", error.response?.data || error.message);
      alert(`Erro: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Nova Promotora</h2>
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
                  <CardTitle>Dados da Promotora</CardTitle>
                </CardHeader>
                <CardContent>
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
                      name="razao_social"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a razão social" {...field} />
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
                              placeholder="00.000.000/0000-00"
                              {...field}
                              maxLength={18}
                              onChange={(e) => {
                                let val = e.target.value;
                                val = val
                                  .replace(/\D/g, "")
                                  .replace(/^(\d{2})(\d)/, "$1.$2")
                                  .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                                  .replace(/\.(\d{3})(\d)/, ".$1/$2")
                                  .replace(/(\d{4})(\d)/, "$1-$2")
                                  .slice(0, 18);
                                field.onChange(val);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                    <FormField
                      control={methods.control}
                      name="rateio_master"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rateio Master (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="master_id"
                      render={({ field }) => (
                        <FormItem className={masterValue === "0" ? "" : "hidden"}>
                          <FormLabel>Master ID (UUID)</FormLabel>
                          <FormControl>
                            <Combobox
                              data={master}
                              displayField="nome"
                              value={master.find((item) => item.id === field.value) ?? null}
                              onChange={(selected) => {
                                field.onChange(selected?.id);
                              }}
                              searchFields={["nome"]}
                              placeholder="Selecione uma promotora"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="rateio_sub"
                      render={({ field }) => (
                        <FormItem className={masterValue === "0" ? "" : "hidden"}>
                          <FormLabel>Rateio Sub (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="master_id"
                      render={({ field }) => (
                        <FormItem className={masterValue === "0" ? "" : "hidden"}>
                          <FormLabel>Master ID (UUID)</FormLabel>
                          <FormControl>
                            <Combobox
                              data={master}
                              displayField="nome"
                              value={master.find((item) => item.id === field.value) ?? null}
                              onChange={(selected) => {
                                field.onChange(selected?.id);
                              }}
                              searchFields={["nome"]}
                              placeholder="Selecione uma promotora"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                                    style={{ backgroundColor: color }}></span>
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
                    <div
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-input data-[dragging=true]:bg-accent/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors">
                      <input
                        {...getInputProps()}
                        className="sr-only"
                        aria-label="Upload image file"
                      />
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
                            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
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
