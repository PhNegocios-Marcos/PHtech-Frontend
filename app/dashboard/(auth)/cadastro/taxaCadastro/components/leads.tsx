"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { TaxaCarregando } from "./leads_carregando";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TaxaModal } from "./TaxaModal";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type TaxaLinha = {
  cad_tac_id: number;
  cad_tac_valor_minimo: string;
  cad_tac_valor_maximo: string;
  cad_tac_valor_cobrado: string;
};

export function TaxaCadastroTable() {
  const router = useRouter();
  const { token } = useAuth();
  const [taxas, setTaxas] = React.useState<TaxaLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedTaxa, setSelectedTaxa] = React.useState<TaxaLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

    useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
    sessionStorage.clear();
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  React.useEffect(() => {
    async function fetchTaxas() {
      if (!token) {
        toast.error("Token não encontrado. Faça login.");
        return;
      }

      if (!API_BASE_URL) {
        toast.error("API_BASE_URL não configurado.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/faixa-valor-cobrado/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache"
          }
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData?.erro || `Erro ${res.status}: ${res.statusText}`;
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();
        setTaxas(data);
      } catch (error: any) {
        console.error("Erro ao carregar faixas de taxa:", error);
        toast.error("Erro ao carregar faixas de taxa: " + (error?.message || error));
      }
    }

    fetchTaxas();
  }, [token, refreshKey]);

  const filteredTaxas = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return taxas.filter((s) =>
      [s.cad_tac_valor_minimo, s.cad_tac_valor_maximo, s.cad_tac_valor_cobrado].some((campo) =>
        (campo || "").toLowerCase().includes(filtroLower)
      )
    );
  }, [filtro, taxas]);

  const columns: ColumnDef<TaxaLinha>[] = [
    {
      accessorKey: "cad_tac_id",
      header: "ID",
      cell: (info) => <strong>{info.getValue() as number}</strong>
    },
    { accessorKey: "cad_tac_valor_minimo", header: "Valor Mínimo" },
    { accessorKey: "cad_tac_valor_maximo", header: "Valor Máximo" },
    { accessorKey: "cad_tac_valor_cobrado", header: "Valor Cobrado" },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar faixa de taxa">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredTaxas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase()),
    state: { globalFilter }
  });

  const handleRowDoubleClick = (taxa: TaxaLinha) => setSelectedTaxa(taxa);
  const handleCloseDrawer = () => setSelectedTaxa(null);
  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <>
      {!selectedTaxa ? (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Faixas de Taxa</CardTitle>
          </CardHeader>

          <CardContent>
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
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {!header.isPlaceholder &&
                            (typeof header.column.columnDef.header === "function"
                              ? header.column.columnDef.header(header.getContext() as any)
                              : String(header.column.columnDef.header))}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center">
                        <TaxaCarregando />
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
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
            </div>
          </CardContent>
        </Card>
      ) : (
        <TaxaModal
          isOpen={!!selectedTaxa}
          taxa={selectedTaxa}
          onClose={() => {
            handleCloseDrawer();
            handleRefresh();
          }}
          onRefresh={handleRefresh}
        />
      )}
    </>
  );
}
