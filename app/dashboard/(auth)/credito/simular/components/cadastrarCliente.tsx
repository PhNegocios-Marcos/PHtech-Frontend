"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { useAuth } from "@/contexts/AuthContext";

type Telefone = { ddd: string; numero: string };
type Endereco = {
  cep: string;
  logradouro: string;
  numero: number;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  uf: string;
};
type Email = { email: string; status: number };
type DadosBancarios = {
  id_banco: string;
  agencia: string;
  conta: string;
  status: number;
};

type FormDataType = {
  nome: string;
  nome_pai: string;
  tipo_documento: string;
  numero_documento: string;
  cpf: string;
  sexo: string;
  telefones: { [key: number]: Telefone };
  enderecos: { [key: number]: Endereco };
  emails: { [key: number]: Email };
  dados_bancarios: { [key: number]: DadosBancarios };
};

interface PropostaProps {
  cpf: string;
}

export default function Proposta({ cpf }: PropostaProps) {
  const [formData, setFormData] = useState<FormDataType>({
    nome: "",
    nome_pai: "",
    tipo_documento: "1",
    numero_documento: "",
    cpf: cpf,
    sexo: "M",
    telefones: {
      0: { ddd: "", numero: "" },
      1: { ddd: "", numero: "" },
      2: { ddd: "", numero: "" }
    },
    enderecos: {
      0: {
        cep: "",
        logradouro: "",
        numero: 0,
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        uf: ""
      }
    },
    emails: {
      0: {
        email: "",
        status: 1
      }
    },
    dados_bancarios: {
      0: {
        id_banco: "019611f9-3d2d-7200-9289-688323e474b5",
        agencia: "",
        conta: "",
        status: 1
      }
    }
  });

  const handleChange = (path: string, value: any) => {
    const keys = path.split(".");
    const updated = { ...formData };
    let obj: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    setFormData(updated);
  };

  const { token } = useAuth();

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Cliente cadastrado com sucesso!");
      } else {
        alert("Erro ao cadastrar cliente.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro inesperado.");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-bold">Cadastro de Cliente</h1>

      <input
        placeholder="Nome"
        value={formData.nome}
        onChange={(e) => handleChange("nome", e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        placeholder="Nome do Pai"
        value={formData.nome_pai}
        onChange={(e) => handleChange("nome_pai", e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        placeholder="Tipo Documento"
        value={formData.tipo_documento}
        onChange={(e) => handleChange("tipo_documento", e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        placeholder="Número Documento"
        value={formData.numero_documento}
        onChange={(e) => handleChange("numero_documento", e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        placeholder="CPF"
        value={formData.cpf}
        onChange={(e) => handleChange("cpf", e.target.value)}
        className="w-full rounded border p-2"
        disabled
      />
      <input
        placeholder="Sexo"
        value={formData.sexo}
        onChange={(e) => handleChange("sexo", e.target.value)}
        className="w-full rounded border p-2"
      />

      {/* Telefones (exemplo do primeiro telefone) */}
      <div>
        <h2 className="mt-4 font-semibold">Telefone 1</h2>
        <input
          placeholder="DDD"
          value={formData.telefones[0].ddd}
          onChange={(e) => handleChange("telefones.0.ddd", e.target.value)}
          className="mr-2 w-20 rounded border p-2"
        />
        <input
          placeholder="Número"
          value={formData.telefones[0].numero}
          onChange={(e) => handleChange("telefones.0.numero", e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      {/* Endereço (exemplo do primeiro) */}
      <div>
        <h2 className="mt-4 font-semibold">Endereço</h2>
        <input
          placeholder="CEP"
          value={formData.enderecos[0].cep}
          onChange={(e) => handleChange("enderecos.0.cep", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Logradouro"
          value={formData.enderecos[0].logradouro}
          onChange={(e) => handleChange("enderecos.0.logradouro", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Número"
          type="number"
          value={formData.enderecos[0].numero}
          onChange={(e) => handleChange("enderecos.0.numero", Number(e.target.value))}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Complemento"
          value={formData.enderecos[0].complemento}
          onChange={(e) => handleChange("enderecos.0.complemento", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Bairro"
          value={formData.enderecos[0].bairro}
          onChange={(e) => handleChange("enderecos.0.bairro", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Cidade"
          value={formData.enderecos[0].cidade}
          onChange={(e) => handleChange("enderecos.0.cidade", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Estado"
          value={formData.enderecos[0].estado}
          onChange={(e) => handleChange("enderecos.0.estado", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="UF"
          value={formData.enderecos[0].uf}
          onChange={(e) => handleChange("enderecos.0.uf", e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      {/* E-mails (exemplo do primeiro) */}
      <div>
        <h2 className="mt-4 font-semibold">E-mail</h2>
        <input
          placeholder="E-mail"
          value={formData.emails[0].email}
          onChange={(e) => handleChange("emails.0.email", e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      {/* Dados Bancários (exemplo do primeiro) */}
      <div>
        <h2 className="mt-4 font-semibold">Dados Bancários</h2>
        <input
          placeholder="Agência"
          value={formData.dados_bancarios[0].agencia}
          onChange={(e) => handleChange("dados_bancarios.0.agencia", e.target.value)}
          className="w-full rounded border p-2"
        />
        <input
          placeholder="Conta"
          value={formData.dados_bancarios[0].conta}
          onChange={(e) => handleChange("dados_bancarios.0.conta", e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <Button onClick={handleSubmit} className="mt-4">
        Cadastrar
      </Button>
    </div>
  );
}
