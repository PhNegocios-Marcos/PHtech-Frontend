"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const createSchema = z.object({
  convenio_hash: z.string().min(1, "Convênio é obrigatório"),
  idade_minima: z.string().min(1, "Idade mínima é obrigatória"),
  idade_maxima: z.string().min(1, "Idade máxima é obrigatória"),
  prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
  valor_bruto_minimo: z.string().min(1, "Valor bruto mínimo é obrigatório"),
  valor_bruto_maximo: z.string().min(1, "Valor bruto máximo é obrigatório"),
  margem_minima: z.string().min(1, "Margem mínima é obrigatória"),
  margem_maxima: z.string().min(1, "Margem máxima é obrigatória"),
  margem_seguranca: z.string().min(1, "Margem de segurança é obrigatória")
});

const updateSchema = z.object({
  rotina_operacional_hash: z.string().min(1, "Hash é obrigatório"),
  valor_bruto_minimo: z.string().min(1, "Valor bruto mínimo é obrigatório"),
  valor_bruto_maximo: z.string().min(1, "Valor bruto máximo é obrigatório")
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

type Option = {
  id: string;
  nome: string;
};

type RoteiroOperacional = {
  rotina_operacional_hash: string;
  convenio_hash?: string;
  idade_minima: number;
  idade_maxima: number;
  prazo_minimo: number;
  prazo_maximo: number;
  valor_bruto_minimo: string;
  valor_bruto_maximo: string;
  margem_minima: string;
  margem_maxima: string;
  margem_seguranca: string;
};

export default function RoteiroOperacionalPage() {
  const [loading, setLoading] = useState(false);
  const [convenios, setConvenios] = useState<Option[]>([]);
  const [roteiros, setRoteiros] = useState<RoteiroOperacional[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRoteiro, setSelectedRoteiro] = useState<RoteiroOperacional | null>(null);

  const { token } = useAuth();
  const { toast } = useToast();

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      convenio_hash: "",
      idade_minima: "",
      idade_maxima: "",
      prazo_minimo: "",
      prazo_maximo: "",
      valor_bruto_minimo: "",
      valor_bruto_maximo: "",
      margem_minima: "",
      margem_maxima: "",
      margem_seguranca: ""
    }
  });

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      rotina_operacional_hash: "",
      valor_bruto_minimo: "",
      valor_bruto_maximo: ""
    }
  });

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/convenio`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((c: any) => ({
          id: c.convenio_hash,
          nome: c.convenio_nome
        }));
        setConvenios(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar convênios",
          variant: "destructive"
        });
      }
    }

    async function fetchRoteiros() {
      try {
        const res = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Roteiros recebidos:", res.data); // Debug log
        setRoteiros(res.data);
      } catch (error) {
        console.error("Erro ao carregar roteiros", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar roteiros operacionais",
          variant: "destructive"
        });
      }
    }

    fetchConvenios();
    fetchRoteiros();
  }, [token, toast]);

  const onCreateSubmit = async (data: CreateFormData) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/rotina-operacional/criar`, {
        convenio_hash: data.convenio_hash,
        idade_minima: data.idade_minima,
        idade_maxima: data.idade_maxima,
        prazo_minimo: data.prazo_minimo,
        prazo_maximo: data.prazo_maximo,
        valor_bruto_minimo: parseFloat(data.valor_bruto_minimo),
        valor_bruto_maximo: parseFloat(data.valor_bruto_maximo),
        margem_minima: data.margem_minima,
        margem_maxima: data.margem_maxima,
        margem_seguranca: data.margem_seguranca
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast({
        title: "Sucesso",
        description: "Roteiro operacional cadastrado com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      createForm.reset();
      // Refresh list
      const res = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Roteiros atualizados:", res.data); // Debug log
      setRoteiros(res.data);
    } catch (error) {
      console.error("Erro ao cadastrar roteiro:", error);
      toast({
        title: "Erro",
        description: "Falha ao cadastrar roteiro operacional",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onUpdateSubmit = async (data: UpdateFormData) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/rotina-operacional/atualizar`, {
        rotina_operacional_hash: data.rotina_operacional_hash,
        valor_bruto_minimo: parseFloat(data.valor_bruto_minimo),
        valor_bruto_maximo: parseFloat(data.valor_bruto_maximo)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast({
        title: "Sucesso",
        description: "Roteiro operacional atualizado com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      setIsUpdateModalOpen(false);
      updateForm.reset();
      // Refresh list
      const res = await axios.get(`${API_BASE_URL}/rotina-operacional/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Roteiros atualizados:", res.data); // Debug log
      setRoteiros(res.data);
    } catch (error) {
      console.error("Erro ao atualizar roteiro:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar roteiro operacional",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<RoteiroOperacional>[] = [
    {
      accessorKey: "convenio_hash",
      header: "Convênio",
      cell: ({ row }) => <span>{row.original.convenio_hash ? row.original.convenio_hash.slice(0, 8) + "..." : "N/A"}</span>
    },
    {
      accessorKey: "idade_minima",
      header: "Idade Mínima"
    },
    {
      accessorKey: "idade_maxima",
      header: "Idade Máxima"
    },
    {
      accessorKey: "prazo_minimo",
      header: "Prazo Mínimo"
    },
    {
      accessorKey: "prazo_maximo",
      header: "Prazo Máximo"
    },
    {
      accessorKey: "valor_bruto_minimo",
      header: "Valor Bruto Mín.",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.valor_bruto_minimo).toFixed(2)}</span>
    },
    {
      accessorKey: "valor_bruto_maximo",
      header: "Valor Bruto Máx.",
      cell: ({ row }) => <span>R$ {parseFloat(row.original.valor_bruto_maximo).toFixed(2)}</span>
    },
    {
      accessorKey: "margem_minima",
      header: "Margem Mín.",
      cell: ({ row }) => <span>{row.original.margem_minima}%</span>
    },
    {
      accessorKey: "margem_maxima",
      header: "Margem Máx.",
      cell: ({ row }) => <span>{row.original.margem_maxima}%</span>
    },
    {
      accessorKey: "margem_seguranca",
      header: "Margem Segurança",
      cell: ({ row }) => <span>{row.original.margem_seguranca}%</span>
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedRoteiro(row.original);
            updateForm.setValue("rotina_operacional_hash", row.original.rotina_operacional_hash);
            updateForm.setValue("valor_bruto_minimo", row.original.valor_bruto_minimo);
            updateForm.setValue("valor_bruto_maximo", row.original.valor_bruto_maximo);
            setIsUpdateModalOpen(true);
          }}
        >
          Editar
        </Button>
      )
    }
  ];

  const table = useReactTable({
    data: roteiros,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciamento de Roteiros Operacionais</h1>

      <Card className="mb-8 border-0 shadow-lg rounded-xl bg-gray-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">Cadastrar Novo Roteiro</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <FormProvider {...createForm}>
            <Form {...createForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={createForm.control}
                  name="convenio_hash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Convênio</FormLabel>
                      <FormControl>
                        <Combobox
                          data={convenios}
                          displayField="nome"
                          value={convenios.find((c) => c.id === field.value) || null}
                          onChange={(option: Option | null) => {
                            field.onChange(option ? option.id : "");
                          }}
                          searchFields={["nome"]}
                          placeholder="Selecione um Convênio"
                          /* @ts-ignore */
                          className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="idade_minima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Idade Mínima</FormLabel>
                      <FormControl>
                        <Input placeholder="18" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="idade_maxima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Idade Máxima</FormLabel>
                      <FormControl>
                        <Input placeholder="65" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="prazo_minimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Prazo Mínimo</FormLabel>
                      <FormControl>
                        <Input placeholder="6" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="prazo_maximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Prazo Máximo</FormLabel>
                      <FormControl>
                        <Input placeholder="36" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="valor_bruto_minimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Valor Bruto Mínimo</FormLabel>
                      <FormControl>
                        <Input placeholder="500.00" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="valor_bruto_maximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Valor Bruto Máximo</FormLabel>
                      <FormControl>
                        <Input placeholder="15500.50" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="margem_minima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Margem Mínima</FormLabel>
                      <FormControl>
                        <Input placeholder="20" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="margem_maxima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Margem Máxima</FormLabel>
                      <FormControl>
                        <Input placeholder="25" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="margem_seguranca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Margem de Segurança</FormLabel>
                      <FormControl>
                        <Input placeholder="50" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => createForm.reset()}
                  className="rounded-md border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  onClick={createForm.handleSubmit(onCreateSubmit)}
                  disabled={loading}
                  className="rounded-md text-white transition-colors"
                >
                  {loading ? "Salvando..." : "Cadastrar Roteiro"}
                </Button>
              </div>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>

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

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-700">Atualizar Roteiro Operacional</DialogTitle>
          </DialogHeader>
          <FormProvider {...updateForm}>
            <Form {...updateForm}>
              <div className="space-y-6">
                <FormField
                  control={updateForm.control}
                  name="valor_bruto_minimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Valor Bruto Mínimo</FormLabel>
                      <FormControl>
                        <Input placeholder="500.01" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="valor_bruto_maximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Valor Bruto Máximo</FormLabel>
                      <FormControl>
                        <Input placeholder="25500.50" {...field} className="rounded-md border-gray-300" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="rounded-md border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={updateForm.handleSubmit(onUpdateSubmit)}
                  disabled={loading}
                  className="rounded-md text-white transition-colors"
                >
                  {loading ? "Atualizando..." : "Atualizar"}
                </Button>
              </div>
            </Form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}