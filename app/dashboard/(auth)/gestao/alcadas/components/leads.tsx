"use client";

import React from "react";
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
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CarregandoTable } from "./leads_carregando";
import { UsuarioDrawer } from "./UsuarioModal";

type Usuario = {
  id: string;
  nome: string;
  status: string;
};

// Lista de patentes ninja para simular mudanças de status
const statusNinja = ["Genin", "Chuunin", "okubetsu Jounin", "Jounin", "ANBU", "Raiz", "Sannin", "Kage", "Herói Lendário"];

const mockUsuarios = {
  usuarios: {
    "1": { nome: "Genin", status: 2 }, // Genin
    "2": { nome: "Chuunin", status: 3 },  // Chuunin
    "3": { nome: "okubetsu Jounin", status: 4 },       // Tokubetsu Jounin
    "4": { nome: "Jounin", status: 5 }, // Jounin
    "5": { nome: "ANBU", status: 6 },            // ANBU
    "6": { nome: "Raiz", status: 7 },         // Raiz
    "7": { nome: "Sannin", status: 8 },        // Sannin
    "8": { nome: "Kage", status: 9 },        // Kage
    "9": { nome: "Herói Lendário", status: 10 }, // Herói Lendário
  },
};


const usuarioColumns: ColumnDef<Usuario>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "status", header: "Status" },
];

export function UsuariosTable() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { token } = useAuth();

  React.useEffect(() => {
    async function fetchUsuarios() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const data = mockUsuarios;
        const usuariosArray = Object.entries(data.usuarios).map(
          ([id, usuario]: [string, any]) => ({
            id,
            nome: usuario.nome,
            status: usuario.status,
          })
        );
        setUsuarios(usuariosArray);
      } catch (error: any) {
        console.error("Erro simulado:", error.message || error);
      }
    }

    fetchUsuarios();
  }, [token]);

  // Troca o status para o próximo da lista
  const toggleStatus = (id: string) => {
    setUsuarios((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const index = statusNinja.indexOf(user.status);
          const nextStatus = statusNinja[(index + 1) % statusNinja.length];
          return { ...user, status: nextStatus };
        }
        return user;
      })
    );
  };

  const table = useReactTable({
    data: usuarios,
    columns: usuarioColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (usuario: Usuario) => {
    toggleStatus(usuario.id); // Simula alteração ao clicar
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col justify-between">
        <CardTitle>Alçadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nome")?.setFilterValue(event.target.value)
            }
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

        <div className="rounded-md border">
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
                  <TableRow
                    key={row.id}
                    onDoubleClick={() => handleRowClick(row.original)}
                    className="hover:bg-muted cursor-pointer"
                  >
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

        <UsuarioDrawer
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          usuario={selectedUser}
        />
      </CardContent>
    </Card>
  );
}
