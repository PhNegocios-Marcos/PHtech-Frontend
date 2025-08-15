"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CarregandoTable } from "./tabela_carregando";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Historico = {
  id: string;
  acao: string;
  data: string;
  usuario: string;
  detalhes: string;
};

export default function HistoricoCliente({ cliente }: { cliente: any }) {
  const { token } = useAuth();
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHistorico() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/cliente/${cliente.cpf}/historico`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHistorico(res.data);
      } catch (error) {
        console.error("Erro ao carregar histórico", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistorico();
  }, [cliente.cpf, token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ação</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <CarregandoTable />
            ) : historico.length > 0 ? (
              historico.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.acao}</TableCell>
                  <TableCell>{new Date(item.data).toLocaleString()}</TableCell>
                  <TableCell>{item.usuario}</TableCell>
                  <TableCell>{item.detalhes}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum histórico encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}