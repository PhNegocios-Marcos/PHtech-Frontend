"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { SeguradorasCarregando } from "./leads_carregando";
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
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SeguradoraModal } from "./SeguradoraModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type SeguradoraLinha = {
  id: string;
  seguradora_hash: string; // Added to match Seguradora type
  nome: string;
  razao_social: string;
  cnpj: string;
  status: number; // Changed to required to align with Seguradora type
};

export function SeguradorasTable() {
  const { token } = useAuth();
  const [seguradoras, setSeguradoras] = React.useState<SeguradoraLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedSeguradora, setSelectedSeguradora] = React.useState<SeguradoraLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    async function fetchSeguradoras() {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/seguradoras/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar seguradoras");

        const data = await res.json();
        setSeguradoras(data); // Assumindo que a API retorna um array de objetos no formato SeguradoraLinha
      } catch (error) {
        console.error("Erro ao carregar seguradoras:", error);
      }
    }

    fetchSeguradoras();
  }, [token, refreshKey]);

  const filteredSeguradoras = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return seguradoras.filter(
      (s) =>
        s.seguradora_hash.toLowerCase().includes(filtroLower) ||
        s.nome.toLowerCase().includes(filtroLower) ||
        s.razao_social.toLowerCase().includes(filtroLower) ||
        s.cnpj.toLowerCase().includes(filtroLower)
    );
  }, [filtro, seguradoras]);

  const columns: ColumnDef<SeguradoraLinha>[] = [
    {
      accessorKey: "seguradora_hash",
      header: "Hash da Seguradora",
      cell: (info) => <strong>{info.getValue() as string}</strong>
    },
    {
      accessorKey: "nome",
      header: "Nome"
    },
    {
      accessorKey: "razao_social",
      header: "Razão Social"
    },
    {
      accessorKey: "cnpj",
      header: "CNPJ"
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.status === 1;
        return (
          <Badge
            className={ativo ? "w-24" : "w-24 border border-red-500 bg-transparent text-red-500"}
            variant={ativo ? "default" : "outline"}>
            {ativo ? "Ativa" : "Inativa"}
          </Badge>
        );
      }
    },
    {
      id: "editar",
      header: "Editar",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRowDoubleClick(row.original)}
          title="Editar seguradora">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredSeguradoras,
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

  const handleRowDoubleClick = (seguradora: SeguradoraLinha) => {
    setSelectedSeguradora(seguradora);
  };

  const handleCloseDrawer = () => {
    setSelectedSeguradora(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      {!selectedSeguradora ? (
        <Card className="col-span-2">
          <CardHeader className="flex flex-col justify-between">
            <CardTitle>Seguradoras</CardTitle>
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
                        <SeguradorasCarregando />
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
        <SeguradoraModal
          isOpen={!!selectedSeguradora}
          seguradora={selectedSeguradora}
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