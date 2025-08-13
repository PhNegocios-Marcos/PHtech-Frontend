"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { TaxaCarregando } from "./leads_carregando";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon } from "@radix-ui/react-icons";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type TaxaLinha = {
  cad_tac_id: number;
  cad_tac_valor_minimo: string;
  cad_tac_valor_maximo: string;
  cad_tac_valor_cobrado: string;
};

export function TaxaCadastroTable() {
  const { token } = useAuth();
  const [taxas, setTaxas] = React.useState<TaxaLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedTaxa, setSelectedTaxa] = React.useState<TaxaLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTaxas() {
      if (!token) {
        setError("Token não encontrado. Faça login.");
        console.error("No token found");
        return;
      }

      if (!API_BASE_URL) {
        setError("API_BASE_URL não configurado.");
        console.error("API_BASE_URL is not defined");
        return;
      }

      const url = `${API_BASE_URL}/faixa-valor-cobrado/listar`;
      // console.log("Fetching from URL:", url);
      // console.log("Using token:", token);

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache"
          }
        });

        console.log("Response status:", res.status);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData?.erro || `Erro ${res.status}: ${res.statusText}`;
          setError(errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log("Fetched data:", data);
        setTaxas(data);
        setError(null);
      } catch (error) {
        console.error("Erro ao carregar faixas de taxa:", error);
        setError("Erro ao carregar faixas de taxa: " + error);
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
    {
      accessorKey: "cad_tac_valor_minimo",
      header: "Valor Mínimo"
    },
    {
      accessorKey: "cad_tac_valor_maximo",
      header: "Valor Máximo"
    },
    {
      accessorKey: "cad_tac_valor_cobrado",
      header: "Valor Cobrado"
    },
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
    globalFilterFn: (row, columnId, filterValue) => {
      return String(row.getValue(columnId))
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    state: {
      globalFilter
    }
  });

  const handleRowDoubleClick = (taxa: TaxaLinha) => {
    setSelectedTaxa(taxa);
  };

  const handleCloseDrawer = () => {
    setSelectedTaxa(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      {!selectedTaxa ? (
        <Card className="col-span-2">
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Faixas de Taxa</CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 text-red-500">
                {error}
              </div>
            )}
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
                        {error ? "Erro ao carregar dados" : <TaxaCarregando />}
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