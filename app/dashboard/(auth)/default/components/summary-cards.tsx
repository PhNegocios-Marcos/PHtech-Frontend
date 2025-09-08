"use client";

import { Award, Briefcase, DollarSign, FileClock } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Interface para tipar os dados esperados da API
interface SummaryData {
  totalValue: number;
  completedOperations: number;
  signatureCollection: number;
  inProgress: number;
  totalValueChange: number;
  completedOperationsChange: number;
  signatureCollectionChange: number;
  inProgressChange: number;
}

// Dados mock para exemplo enquanto a API não está disponível
const mockSummaryData: SummaryData = {
  totalValue: 45231.89,
  completedOperations: 1423,
  signatureCollection: 3500,
  inProgress: 1250,
  totalValueChange: 20.1,
  completedOperationsChange: 5.02,
  signatureCollectionChange: -3.58,
  inProgressChange: -3.58
};

export function SummaryCards() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Função para buscar dados da API


  const dadosDashboard = async () => {

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Erro ao buscar dados dashboard");
      }


      const result = await response.json();
      setData(result);
      setLoading(false);

    } catch (error: any) {
      console.error("Erro na requisição:", error.message || error);

    }
  }

  useEffect(() => {
    dadosDashboard();
  }, []);


  // Formatar número como moeda (BRL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar número com separadores de milhar
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Determinar a classe de cor com base no valor (positivo/negativo)
  const getChangeColorClass = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  // Formatar porcentagem
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-6 bg-gray-100 dark:bg-gray-900 rounded w-3/4 animate-pulse"></div>
              <CardDescription>
                <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-1/2 mt-2 animate-pulse"></div>
              </CardDescription>
              <CardAction>
                <div className="size-4 lg:size-6 bg-gray-100 dark:bg-gray-900 rounded animate-pulse"></div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-100 dark:bg-gray-900 rounded w-1/2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            // onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Valor total operado</CardTitle>
          <CardDescription>
            <span className={getChangeColorClass(data?.totalValueChange || 0)}>
              {formatPercentage(data?.totalValueChange || 0)}
            </span> do mês passado
          </CardDescription>
          <CardAction>
            <DollarSign className="text-primary size-4 lg:size-6" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="font-display text-2xl lg:text-3xl">
            {formatCurrency(data?.totalValue || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operações concluídas</CardTitle>
          <CardDescription>
            <span className={getChangeColorClass(data?.completedOperationsChange || 0)}>
              {formatPercentage(data?.completedOperationsChange || 0)}
            </span> do mês passado
          </CardDescription>
          <CardAction>
            <Briefcase className="text-primary size-4 lg:size-6" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="font-display text-2xl lg:text-3xl">
            {formatNumber(data?.completedOperations || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coleta de assinaturas</CardTitle>
          <CardDescription>
            <span className={getChangeColorClass(data?.signatureCollectionChange || 0)}>
              {formatPercentage(data?.signatureCollectionChange || 0)}
            </span> do mês passado
          </CardDescription>
          <CardAction>
            <Award className="text-primary size-4 lg:size-6" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="font-display text-2xl lg:text-3xl">
            {formatNumber(data?.signatureCollection || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Em andamento</CardTitle>
          <CardDescription>
            <span className={getChangeColorClass(data?.inProgressChange || 0)}>
              {formatPercentage(data?.inProgressChange || 0)}
            </span> do mês passado
          </CardDescription>
          <CardAction>
            <FileClock className="text-primary size-4 lg:size-6" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="font-display text-2xl lg:text-3xl">
            {formatNumber(data?.inProgress || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}