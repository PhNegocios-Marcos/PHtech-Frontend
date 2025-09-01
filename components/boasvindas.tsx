"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const hoje = new Date();

const nomeDia = hoje.toLocaleDateString("pt-BR", { weekday: "long" });

const dataFormatada = hoje.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

const CampoBoasVindas: React.FC = () => {
  const { userData } = useAuth();

  // console.log("userData: ", userData);

  // const usuario = userData ?? null;
  const nomeCompleto = (userData as any)?.nome ?? "Usuário";

  // 🟢 Pega só o primeiro nome
  const primeiroNome = nomeCompleto.split(" ")[0];

  return (
    <div className="mb-3 md:mb-0">
      <h2 className="text-1 dark:text-dark-50 truncate font-medium tracking-wide leading-none text-gray-800 dark:text-white md:text-2xl">
        Olá <span className="text-primary">{primeiroNome}</span>!<br/>
        <span className="text-sm mt-0 text-gray-500 dark:text-gray-400">Hoje é <span>{nomeDia}</span>,{" "} dia {dataFormatada}</span>
      </h2>
    </div>
  );
};

export default CampoBoasVindas;
