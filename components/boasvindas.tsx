"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const hoje = new Date();

const nomeDia = hoje.toLocaleDateString("pt-BR", { weekday: "long" });

const dataFormatada = hoje.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const CampoBoasVindas: React.FC = () => {
  const { userData } = useAuth();

  const usuarios = userData?.usuarios;
  const usuario = usuarios ? Object.values(usuarios)[0] : null;
  const nomeCompleto = usuario?.nome ?? "Usuário";

  // 🟢 Pega só o primeiro nome
  const primeiroNome = nomeCompleto.split(" ")[0];

  return (
    <div className="mb-3 md:mb-0">
      <h2 className="truncate text-1 md:text-2xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
        Olá <span className="text-primary">{primeiroNome}</span>, hoje é{" "}
        <span>{nomeDia}</span>,{" "}
        <span className="text-primary">{dataFormatada}</span>
      </h2>
    </div>
  );
};

export default CampoBoasVindas;
