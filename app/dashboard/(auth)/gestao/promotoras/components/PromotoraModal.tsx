"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereco: string;
  status: number;
};

type UsuarioDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
};

// Itens do menu lateral
const items = [
  { id: "recents", label: "Recents" },
  { id: "home", label: "Home" },
  { id: "applications", label: "Applications" },
  { id: "desktop", label: "Desktop" },
  { id: "downloads", label: "Downloads" },
  { id: "documents", label: "Documents" }
] as const;

const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Selecione pelo menos um item."
  })
});

type DisplayFormValues = z.infer<typeof displayFormSchema>;

const defaultValues: Partial<DisplayFormValues> = {
  items: ["recents", "home"]
};

export function UsuarioDrawer({ isOpen, onClose, usuario }: UsuarioDrawerProps) {
  const [formData, setFormData] = useState<Usuario | null>(null);
  const { token } = useAuth();

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues
  });

  useEffect(() => {
    if (usuario) {
      setFormData({ ...usuario });
    }
  }, [usuario]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmitUsuario = async () => {
    if (!token || !formData) return;

    const payload = {
      id: formData.id,
      nome: formData.nome,
      endereco: formData.endereco,
      telefone: formData.telefone,
      status: Number(formData.status)
    };

    try {
      await axios.put("http://127.0.0.1:8000/usuario/atualizar", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Usuário atualizado com sucesso!");
      onClose();
    } catch (error: any) {
      alert(
        `Erro ao atualizar usuário: ${
          error.response ? JSON.stringify(error.response.data) : error.message
        }`
      );
    }
    window.location.reload();
  };

  const onSubmitSidebar = (data: DisplayFormValues) => {
    alert(`Itens selecionados: ${JSON.stringify(data.items, null, 2)}`);
  };

  return (
    <>
      <Card>
        <div onClick={onClose} className="fixed inset-0 z-40 bg-gray-900/50" aria-hidden="true" />

        <aside className="fixed top-0 right-0 z-50 flex h-full w-2/2 flex-col bg-white shadow-lg md:w-1/2">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Editar Usuário</h2>
            <button
              onClick={onClose}
              aria-label="Fechar painel"
              className="text-2xl text-gray-600 hover:text-gray-900">
              ×
            </button>
          </div>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitSidebar)} className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="items"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Sidebar</FormLabel>
                        <FormDescription>
                          Selecione os itens a serem exibidos na barra lateral.
                        </FormDescription>
                      </div>
                      {items.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="items"
                          render={({ field }) => (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(field.value?.filter((v) => v !== item.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button onClick={handleSubmitUsuario}>Salvar Alterações</Button>
              </form>
            </Form>
          </CardContent>
        </aside>
      </Card>
    </>
  );
}
