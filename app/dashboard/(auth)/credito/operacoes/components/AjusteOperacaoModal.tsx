"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";

type AjusteOperacaoModalProps = {
  isOpen: boolean;
  evento: any;
  onClose: () => void;
};

export default function AjusteOperacaoModal({ isOpen, evento, onClose }: AjusteOperacaoModalProps) {
  const { token } = useAuth();
  const [form, setForm] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setFiles((prev) => [...prev, ...mappedFiles]);
    setFile(acceptedFiles[0]); // Mantém compatibilidade com envio único
  }, []);

  const {
    getRootProps,
    getInputProps,
    open: openFileDialog
  } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    noClick: true,
    noKeyboard: true
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setFile(null);
  };

  if (!isOpen || !evento) return null;

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload;
      if (evento.tipoPendencia === "upload") {
        payload = new FormData();
        payload.append("documento", file as Blob);
      } else {
        payload = { ...form };
      }
      await axios.post("/api/pendencia/resolver", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(evento.tipoPendencia === "upload" && { "Content-Type": "multipart/form-data" })
        }
      });
      toast.success("Pendência resolvida com sucesso!");
      onClose();
    } catch (err: any) {
      toast.error("Erro ao resolver pendência");
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
      <aside className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resolver Pendência</CardTitle>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900">
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {evento.campos ? (
                // Se campos é um objeto, transforme em array com um único elemento
                [evento.campos].map((campo: any) => {
                  if (campo.type === "file") {
                    return (
                      <div className="mt-6" key={campo.name}>
                        <CardTitle>{campo.label}</CardTitle>
                        <div
                          {...getRootProps()}
                          className="border-input relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors">
                          <input {...getInputProps()} className="sr-only" />
                          {files.length > 0 ? (
                            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
                              {files.map((file) => (
                                <div
                                  key={file.id}
                                  className="bg-accent relative aspect-square rounded-md border">
                                  {file.file.type.startsWith("image/") ? (
                                    <img
                                      src={file.preview}
                                      alt={file.file.name}
                                      className="size-full rounded-[inherit] object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <span className="text-xs">{file.file.name}</span>
                                    </div>
                                  )}
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
                              <p className="text-muted-foreground text-xs">
                                PNG, JPG ou PDF (max. 5MB)
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                className="mt-4"
                                onClick={openFileDialog}>
                                <UploadIcon className="-ms-1 opacity-60" />
                                Selecionar arquivo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={campo.name}>
                      <label className="mb-2 block font-medium">{campo.label}</label>
                      <Input
                        type={campo.type}
                        value={form[campo.name] || ""}
                        onChange={(e) => handleChange(campo.name, e.target.value)}
                        placeholder={campo.label}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground">
                  Nenhum campo configurado para esta pendência
                </p>
              )}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Enviar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </aside>
    </>
  );
}
