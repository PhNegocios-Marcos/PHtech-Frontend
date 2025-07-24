"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from "@tanstack/react-table";
import { CarregandoTable } from "./leads_carregando";
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
import { Badge } from "@/components/ui/badge"; // substituto visual para Switch
import { ChevronLeft, ChevronRight, Ellipsis, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PermissoesDrawer } from "./PermissoesModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type PermissaoLinha = {
  categoria: string;
  id: string;
  nome: string;
  status: number;
};

export function PermissoesTable() {
  const { token } = useAuth();
  const [permissoes, setPermissoes] = React.useState<PermissaoLinha[]>([]);
  const [filtro, setFiltro] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedEquipe, setSelectedEquipe] = React.useState<PermissaoLinha | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    async function fetchPermissoes() {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/permissoes/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Erro ao buscar permissões");

        const data = await res.json();

        const arr: PermissaoLinha[] = [];
        for (const [categoria, permissoesArray] of Object.entries(data)) {
          for (const p of permissoesArray as any[]) {
            arr.push({
              categoria,
              id: p.id,
              nome: p.nome,
              status: p.status
            });
          }
        }

        // console.log("arr leads: ", arr);

        setPermissoes(arr);
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    }

    fetchPermissoes();
  }, [token, refreshKey]);

  const filteredPermissoes = React.useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return permissoes.filter(
      (p) =>
        p.nome.toLowerCase().includes(filtroLower) ||
        p.categoria.toLowerCase().includes(filtroLower)
    );
  }, [filtro, permissoes]);

  const columns: ColumnDef<PermissaoLinha>[] = [
    {
      accessorKey: "categoria",
      header: "Módulos",
      cell: (info) => <strong>{info.getValue() as string}</strong>
    },
    {
      accessorKey: "nome",
      header: "Permissão"
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
          title="Editar usuário">
          <Pencil className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];

  const table = useReactTable({
    data: filteredPermissoes,
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

  const handleRowDoubleClick = (equipe: PermissaoLinha) => {
    setSelectedEquipe(equipe);
  };

  const handleCloseDrawer = () => {
    setSelectedEquipe(null);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  function renderHeader(header: any): React.ReactNode {
    if (typeof header.column.columnDef.header === "function") {
      return (header.column.columnDef.header as (ctx: any) => React.ReactNode)(header.getContext());
    }
    return String(header.column.columnDef.header);
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Permissões</CardTitle>
      </CardHeader>

      {!selectedEquipe ? (
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
                    <TableCell colSpan={3} className="p-4 text-center">
                      <CarregandoTable />
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
      ) : (
        <PermissoesDrawer
          isOpen={!!selectedEquipe} // ou true/false conforme sua lógica
          permissao={selectedEquipe}
          onClose={() => {
            handleCloseDrawer();
            handleRefresh();
          }}
          onRefresh={handleRefresh}
        />
      )}
    </Card>
  );
}
