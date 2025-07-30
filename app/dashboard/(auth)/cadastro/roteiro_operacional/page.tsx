"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type RoteiroOperacional = {
  rotina_operacional_hash: string;
  nome: string;
  descricao: string;
  idade_minima: number;
  idade_maxima: number;
  prazo_minimo: number;
  prazo_maximo: number;
  valor_bruto_minimo: string;
  valor_bruto_maximo: string;
  taxa_minima: string;
  taxa_maxima: string;
  usa_margem_seguranca: boolean;
  tac_min: string;
  tac_max: string;
  usa_limite_proposta: boolean;
  quantidade_propostas_ativas: number;
};

const createSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  idade_minima: z.string().min(1, "Idade mínima é obrigatória"),
  idade_maxima: z.string().min(1, "Idade máxima é obrigatória"),
  prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
  valor_bruto_minimo: z.string().min(1, "Valor bruto mínimo é obrigatório"),
  valor_bruto_maximo: z.string().min(1, "Valor bruto máximo é obrigatório"),
  taxa_minima: z.string().min(1, "Taxa mínima é obrigatória"),
  taxa_maxima: z.string().min(1, "Taxa máxima é obrigatória"),
  usa_margem_seguranca: z.enum(["true", "false"], { message: "Selecione uma opção" }),
  tac_min: z.string().min(1, "TAC mínima é obrigatória"),
  tac_max: z.string().min(1, "TAC máxima é obrigatória"),
  usa_limite_proposta: z.enum(["true", "false"], { message: "Selecione uma opção" }),
  quantidade_propostas_ativas: z.string().min(1, "Quantidade de propostas ativas é obrigatória"),
});

type CreateFormData = z.infer<typeof createSchema>;

type CadastroRoteiroModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFormData) => void;
};

const CadastroRoteiroModal = ({ isOpen, onClose, onSubmit }: CadastroRoteiroModalProps) => {
  const methods = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      idade_minima: "",
      idade_maxima: "",
      prazo_minimo: "",
      prazo_maximo: "",
      valor_bruto_minimo: "",
      valor_bruto_maximo: "",
      taxa_minima: "",
      taxa_maxima: "",
      usa_margem_seguranca: "false",
      tac_min: "",
      tac_max: "",
      usa_limite_proposta: "false",
      quantidade_propostas_ativas: "",
    },
  });

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 !left-auto z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg"
      >
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Roteiro</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados do Roteiro Operacional</CardTitle>
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
                            <Input placeholder="Digite o nome do roteiro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a descrição" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="idade_minima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade Mínima</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="18" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="idade_maxima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade Máxima</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="65" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="prazo_minimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo Mínimo (meses)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="prazo_maximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo Máximo (meses)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="36" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="valor_bruto_minimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Bruto Mínimo</FormLabel>
                          <FormControl>
                            <Input placeholder="500.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="valor_bruto_maximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Bruto Máximo</FormLabel>
                          <FormControl>
                            <Input placeholder="15500.50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="taxa_minima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa Mínima (% a.m.)</FormLabel>
                          <FormControl>
                            <Input placeholder="1.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="taxa_maxima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa Máxima (% a.m.)</FormLabel>
                          <FormControl>
                            <Input placeholder="5.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="usa_margem_seguranca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usa Margem de Segurança</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="tac_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TAC Mínima</FormLabel>
                          <FormControl>
                            <Input placeholder="100.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="tac_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TAC Máxima</FormLabel>
                          <FormControl>
                            <Input placeholder="500.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="usa_limite_proposta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usa Limite de Proposta</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Sim</SelectItem>
                              <SelectItem value="false">Não</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="quantidade_propostas_ativas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de Propostas Ativas</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
};

export default function RoteiroOperacionalPage() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roteiros, setRoteiros] = useState<RoteiroOperacional[]>([
    {
      rotina_operacional_hash: "RO-001",
      nome: "Roteiro Pessoal",
      descricao: "Roteiro para crédito pessoal",
      idade_minima: 18,
      idade_maxima: 65,
      prazo_minimo: 6,
      prazo_maximo: 36,
      valor_bruto_minimo: "500.00",
      valor_bruto_maximo: "15000.00",
      taxa_minima: "1.5",
      taxa_maxima: "4.99",
      usa_margem_seguranca: true,
      tac_min: "100.00",
      tac_max: "500.00",
      usa_limite_proposta: false,
      quantidade_propostas_ativas: 10,
    },
    {
      rotina_operacional_hash: "RO-002",
      nome: "Roteiro Empresarial",
      descricao: "Roteiro para crédito empresarial",
      idade_minima: 21,
      idade_maxima: 70,
      prazo_minimo: 12,
      prazo_maximo: 48,
      valor_bruto_minimo: "1000.00",
      valor_bruto_maximo: "50000.00",
      taxa_minima: "2.0",
      taxa_maxima: "5.5",
      usa_margem_seguranca: false,
      tac_min: "200.00",
      tac_max: "1000.00",
      usa_limite_proposta: true,
      quantidade_propostas_ativas: 5,
    },
    {
      rotina_operacional_hash: "RO-003",
      nome: "Roteiro Consignado",
      descricao: "Roteiro para crédito consignado",
      idade_minima: 25,
      idade_maxima: 60,
      prazo_minimo: 3,
      prazo_maximo: 24,
      valor_bruto_minimo: "300.00",
      valor_bruto_maximo: "10000.00",
      taxa_minima: "1.2",
      taxa_maxima: "3.5",
      usa_margem_seguranca: true,
      tac_min: "50.00",
      tac_max: "300.00",
      usa_limite_proposta: true,
      quantidade_propostas_ativas: 8,
    },
  ]);

  const { toast } = useToast();

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      idade_minima: "",
      idade_maxima: "",
      prazo_minimo: "",
      prazo_maximo: "",
      valor_bruto_minimo: "",
      valor_bruto_maximo: "",
      taxa_minima: "",
      taxa_maxima: "",
      usa_margem_seguranca: "false",
      tac_min: "",
      tac_max: "",
      usa_limite_proposta: "false",
      quantidade_propostas_ativas: "",
    },
  });

  const onCreateSubmit = (data: CreateFormData) => {
    setLoading(true);
    try {
      const newRoteiro: RoteiroOperacional = {
        rotina_operacional_hash: `RO-${Math.random().toString(36).slice(2, 9)}`,
        nome: data.nome,
        descricao: data.descricao,
        idade_minima: parseInt(data.idade_minima),
        idade_maxima: parseInt(data.idade_maxima),
        prazo_minimo: parseInt(data.prazo_minimo),
        prazo_maximo: parseInt(data.prazo_maximo),
        valor_bruto_minimo: data.valor_bruto_minimo,
        valor_bruto_maximo: data.valor_bruto_maximo,
        taxa_minima: data.taxa_minima,
        taxa_maxima: data.taxa_maxima,
        usa_margem_seguranca: data.usa_margem_seguranca === "true",
        tac_min: data.tac_min,
        tac_max: data.tac_max,
        usa_limite_proposta: data.usa_limite_proposta === "true",
        quantidade_propostas_ativas: parseInt(data.quantidade_propostas_ativas),
      };
      setRoteiros([...roteiros, newRoteiro]);
      toast({
        title: "Sucesso",
        description: "Roteiro operacional cadastrado com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      createForm.reset();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar roteiro:", error);
      toast({
        title: "Erro",
        description: "Falha ao cadastrar roteiro operacional",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<RoteiroOperacional>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
    },
    {
      accessorKey: "idade_minima",
      header: "Idade Mínima",
    },
    {
      accessorKey: "idade_maxima",
      header: "Idade Máxima",
    },
    {
      accessorKey: "prazo_minimo",
      header: "Prazo Mínimo",
    },
    {
      accessorKey: "prazo_maximo",
      header: "Prazo Máximo",
    },
    {
      accessorKey: "valor_bruto_minimo",
      header: "Valor Bruto Mín.",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.valor_bruto_minimo).toFixed(2)}</span>,
    },
    {
      accessorKey: "valor_bruto_maximo",
      header: "Valor Bruto Máx.",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.valor_bruto_maximo).toFixed(2)}</span>,
    },
    {
      accessorKey: "taxa_minima",
      header: "Taxa Mínima",
      cell: ({ row }) => <span>{row.original.taxa_minima}%</span>,
    },
    {
      accessorKey: "taxa_maxima",
      header: "Taxa Máxima",
      cell: ({ row }) => <span>{row.original.taxa_maxima}%</span>,
    },
    {
      accessorKey: "usa_margem_seguranca",
      header: "Usa Margem Segurança",
      cell: ({ row }) => <span>{row.original.usa_margem_seguranca ? "Sim" : "Não"}</span>,
    },
    {
      accessorKey: "tac_min",
      header: "TAC Mínima",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.tac_min).toFixed(2)}</span>,
    },
    {
      accessorKey: "tac_max",
      header: "TAC Máxima",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.tac_max).toFixed(2)}</span>,
    },
    {
      accessorKey: "usa_limite_proposta",
      header: "Usa Limite Proposta",
      cell: ({ row }) => <span>{row.original.usa_limite_proposta ? "Sim" : "Não"}</span>,
    },
    {
      accessorKey: "quantidade_propostas_ativas",
      header: "Propostas Ativas",
    },
  ];

  const table = useReactTable({
    data: roteiros,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciamento de Roteiros Operacionais</h1>
      <div className="mb-8">
        <Button onClick={() => setIsModalOpen(true)} className="rounded-md text-white transition-colors">
          Cadastrar Roteiro
        </Button>
      </div>
      <Card className="border-0 shadow-lg rounded-xl bg-gray-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">Roteiros Operacionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-700 font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-gray-500">
                    Nenhum roteiro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-100">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CadastroRoteiroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateSubmit}
      />
    </div>
  );
}