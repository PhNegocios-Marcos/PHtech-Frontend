"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Alcadas = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereco: string;
  status: number;
};

type AlcadasDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  usuario: Alcadas | null;
  onSuccess?: () => void;
};

export function AlcadaDrawer({ isOpen, onClose, usuario, onSuccess }: AlcadasDrawerProps) {
  const [formData, setFormData] = useState<Alcadas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

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
    if (usuario) {
      setFormData({ ...usuario });
      toast.info(`Editando alçada: ${usuario.nome}`, {
        style: {
          background: 'var(--toast-info)',
          color: 'var(--toast-info-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    }
  }, [usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Autenticação necessária", {
        description: "Faça login para continuar",
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }

    if (!formData) return;

    setIsSubmitting(true);
    const payload = {
      id: formData.id,
      nome: formData.nome,
      endereco: formData.endereco,
      telefone: formData.telefone,
      status: Number(formData.status),
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/usuario/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Alçada atualizada com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao atualizar alçada:", error);
      const errorMessage = error.response?.data?.message || "Erro ao atualizar alçada";
      
      toast.error("Falha na atualização", {
        description: errorMessage,
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" },
  ];

  if (!isOpen || !formData) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-gray-900/50" aria-hidden="true" />

      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[600px] flex-col bg-background shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Editar Alçada</h2>
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-2xl leading-none text-gray-600 hover:text-gray-900"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto p-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium">Nome</label>
            <Input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="mt-1 w-full"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">CPF</label>
            <Input
              name="cpf"
              value={formData.cpf}
              readOnly
              className="mt-1 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Telefone</label>
            <Input
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="mt-1 w-full"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Endereço</label>
            <Input
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="mt-1 w-full"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tipo de Acesso</label>
            <Input
              name="tipo_acesso"
              value={formData.tipo_acesso}
              onChange={handleChange}
              className="mt-1 w-full"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <Combobox
              data={statusOptions}
              displayField="name"
              value={statusOptions.find((opt) => opt.id === formData.status) ?? null}
              onChange={(selected) =>
                setFormData((prev) => (prev ? { ...prev, status: selected.id } : prev))
              }
              label="Status"
              searchFields={["name"]}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="border-t p-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </aside>
    </>
  );
}