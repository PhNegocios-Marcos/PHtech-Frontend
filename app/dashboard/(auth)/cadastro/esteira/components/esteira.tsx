"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./leads_carregando";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { generateMeta } from "@/lib/utils";
import VerEsteira from "./verEsteira";
import { toast } from "sonner";
import toastComponent from "@/utils/toastComponent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Esteira = {
  esteira_hash: any;
  esteira_nome: any;
  esteira_status: number;
  esteira_usuario_criacao: string;
};

export type Props = {
  esteira: Esteira;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
  esteiraHash: any;
};

export default function Produto({ onClose, esteiraHash, esteira }: Props) {
  const { token } = useAuth();
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [esteiraData, setEsteiraData] = useState<Esteira[]>([]);

  const [selectedEsteira, setSelectedEsteira] = useState<Esteira | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleClose = () => {
    setSelectedEsteira(null);
    setIsCadastroOpen(false);
    onClose();
  };

  const handleSelectEsteira = (taxa: Esteira) => {
    setSelectedEsteira(taxa);
    setIsCadastroOpen(true);
  };

  const columns: ColumnDef<Esteira>[] = [
    { accessorKey: "esteira_nome", header: "Nome  da esteira" },
    {
      id: "status_relacionamento",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.esteira_status === 1;

        const toggleStatus = async () => {
          try {
            const novoStatus = ativo ? 0 : 1;

            await axios.put(
              `${API_BASE_URL}/rel-produto-sub-produto-convenio/atualizar`,
              {
                id: row.original.esteira_hash,
                status: novoStatus
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );

            setEsteiraData((prev) =>
              prev.map((item) =>
                item.esteira_hash === row.original.esteira_hash
                  ? { ...item, esteira_status: novoStatus }
                  : item
              )
            );

            toastComponent.success(`Status do produto "${row.original.esteira_nome}" atualizado com sucesso!`);
          } catch (error: any) {
            console.error("Erro ao atualizar status", error);
            toastComponent.error(`Erro ao atualizar status: ${error.response?.data?.detail || error.message}`);
          }
        };

        return (
          <Badge
            onClick={toggleStatus}
            className={`w-24 cursor-pointer ${
              ativo ? "" : "border border-red-500 bg-transparent text-red-500"
            }`}
            variant={ativo ? "default" : "outline"}
          >
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    },
    {
      id: "editar",
      header: "Ver",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleSelectEsteira(row.original)}
          title="Ver esteira"
        >
          <Search className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  useEffect(() => {
    async function fetchRelacionamentos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/processo-esteira/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        setEsteiraData(res.data);
      } catch (error: any) {
        console.error("Erro ao carregar convênios", error);
        toastComponent.error(`Erro ao carregar convênios: ${error.response?.data?.detail || error.message}`);
      }
    }

    fetchRelacionamentos();
  }, [token]);

  useEffect(() => {
    async function fetchRelacionamentos() {
      if (!selectedEsteira) return;

      try {
        const res = await axios.get(
          `${API_BASE_URL}/processo-esteira/ver/${selectedEsteira.esteira_hash}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
      } catch (error: any) {
        console.error("Erro ao carregar convênios", error);
        toastComponent.error(`Erro ao carregar dados da esteira: ${error.response?.data?.detail || error.message}`);
      }
    }

    fetchRelacionamentos();
  }, [token, selectedEsteira]);

  const table = useReactTable({
    data: esteiraData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  });

  return (
    <div className="space-y-6">
      <div className={`${!!selectedEsteira ? 'flex w-full' : 'hidden'}`}>
        <VerEsteira
          isOpen={isCadastroOpen}
          esteiraHash={!!selectedEsteira ? selectedEsteira.esteira_hash : null}
          esteiraData={!!selectedEsteira ? selectedEsteira.esteira_nome : null}
          onClose={handleClose}
        />
      </div>

        <Card className="">
          <CardHeader>
            <CardTitle>Lista de esteiras</CardTitle>
          </CardHeader>
          <CardContent>
            <>
              <div className="mb-4 flex items-center gap-2">
                <Input
                  placeholder="Filtrar por qualquer campo..."
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Colunas <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-10 rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted cursor-pointer">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <CarregandoTable />
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4">
                <div className="text-muted-foreground flex-1 text-sm">
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} linha(s) selecionadas.
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          </CardContent>
        </Card>
        

      {/* <CadastroTabelaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} /> */}
    </div>
  );
}
