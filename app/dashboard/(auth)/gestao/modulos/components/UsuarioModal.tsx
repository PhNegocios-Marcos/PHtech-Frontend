"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext"; // Certifique-se de que este caminho está correto
import { Combobox } from "@/components/Combobox";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

export function UsuarioDrawer({ isOpen, onClose, usuario }: UsuarioDrawerProps) {
  const [formData, setFormData] = useState<Usuario | null>(null);
  const { token } = useAuth(); // ✅ hook sendo chamado dentro do componente

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

  const handleSubmit = async () => {
    if (!token) {
      console.error("Token global não definido! Autenticação inválida.");
      return;
    }

    const payload = {
      id: formData.id,
      nome: formData.nome,
      endereco: formData.endereco,
      telefone: formData.telefone,
      status: Number(formData.status)
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/usuario/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Usuário atualizado:", response.data);
      alert("Usuário atualizado com sucesso!");
      onClose(); // fecha o drawer após sucesso
    } catch (error: any) {
      console.error(
        "Erro ao atualizar usuário:",
        error.response ? error.response.data : error.message
      );
      alert(
        `Erro ao atualizar usuário: ${
          error.response ? JSON.stringify(error.response.data) : error.message
        }`
      );
    }
    window.location.reload();
  };

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 z-40 bg-gray-900/50" aria-hidden="true" />

      {/* Drawer lateral */}
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-2/2 flex-col bg-white shadow-lg md:w-1/2"
        role="dialog"
        aria-modal="true">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Editar Usuário</h2>
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-2xl leading-none text-gray-600 hover:text-gray-900">
            ×
          </button>
        </div>

        {/* Formulário */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-6">
          <div className="h-[100px]">
            <label className="block text-sm font-medium">Nome</label>
            <Input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div className="h-[100px]">
            <label className="block text-sm font-medium">CPF</label>
            <Input
              name="cpf"
              value={formData.cpf}
              readOnly
              className="mt-1 w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-500"
            />
          </div>

          <div className="h-[100px]">
            <label className="block text-sm font-medium">Email</label>
            <Input
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 w-full cursor-not-allowed rounded border bg-gray-100 p-2 text-gray-500"
            />
          </div>

          <div className="h-[100px]">
            <label className="block text-sm font-medium">Telefone</label>
            <Input
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div className="h-[100px]">
            <label className="block text-sm font-medium">Endereço</label>
            <Input
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div className="h-[100px]">
            <label className="block text-sm font-medium">Tipo de Acesso</label>
            <Input
              name="tipo_acesso"
              value={formData.tipo_acesso}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div className="h-[100px]">
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
            />
          </div>
        </div>

        {/* Botão de salvar */}
        <div className="p-4">
          <Button onClick={handleSubmit}>Salvar Alterações</Button>
        </div>
      </aside>
    </>
  );
}
