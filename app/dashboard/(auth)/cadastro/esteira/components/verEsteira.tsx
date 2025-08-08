"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  PersonIcon,
  AvatarIcon,
  CheckCircledIcon,
  CircleIcon
} from "@radix-ui/react-icons";

interface Etapa {
  relacionamento_esteira_estapa_hash: string;
  info_etapa: {
    etapa_hash: string;
    etapa_nome: string;
    etapa_cor: string;
    etapa_visualiza: number;
    etapa_situacao: string;
    etapa_status: number;
  };
  indice_etapa: number;
  processos?: Processo[];
}

interface Processo {
  dadosStatusEtapa: {
    status_hash: string;
    status_nome: string;
    status_cor: string;
    status_tipo: string;
    etapa_hash: string;
    status_status: number;
  };
  dadosAcaoStatusAtual: {
    esteira_acao_status_hash: string;
    esteira_acao_status_atual: string;
    esteira_acao_status_aprova: string | null;
    esteira_acao_status_reprova: string | null;
    esteira_acao_status_pendencia: string | null;
    esteira_acao_atuacao_alcada: string;
    esteira_acao_paradinha: number;
    esteira_acao_status: number;
    processo_hash?: string;
    processo_nome?: string;
    processo_descricao?: string;
    esteira_acao_reinicio: number | null;
    esteira_acao_edita_cadastro: number | null;
    esteira_acao_anexa_arquivo: number | null;
    esteira_acao_resolve_pendencia: number | null;
    [key: string]: any;
  };
}

interface Status {
  status_hash: string;
  status_nome: string;
  status_cor: string;
  status_tipo: string;
  etapa_hash: string;
  status_status: number;
}

interface ProcessoEsteiraViewerProps {
  esteiraHash: any;
  esteiraData: any;
  onClose: () => void;
  isOpen: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ProcessoEsteiraViewer: React.FC<ProcessoEsteiraViewerProps> = ({
  esteiraData,
  esteiraHash,
  onClose
}) => {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const handleNotificationToggle = (notificationType: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationType)
        ? prev.filter((item) => item !== notificationType)
        : [...prev, notificationType]
    );
  };

  const handleLocalStatusChange = (acaoHash: string, field: string, newValue: string) => {
    setEtapas((prevEtapas) =>
      prevEtapas.map((etapa) => ({
        ...etapa,
        processos: etapa.processos?.map((processo) => {
          if (processo.dadosAcaoStatusAtual.esteira_acao_status_hash === acaoHash) {
            return {
              ...processo,
              dadosAcaoStatusAtual: {
                ...processo.dadosAcaoStatusAtual,
                [field]: newValue || null
              }
            };
          }
          return processo;
        })
      }))
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const fetchEtapas = async () => {
    try {
      setLoading(true);

      const resEtapas = await axios.get(`${API_BASE_URL}/processo-esteira/ver/${esteiraHash}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const etapasComProcessos = await Promise.all(
        resEtapas.data.map(async (etapa: Etapa) => {
          if (etapa.info_etapa.etapa_visualiza === 1) {
            try {
              const resProcessos = await axios.get(
                `${API_BASE_URL}/processo-esteira/ver-processos/${etapa.info_etapa.etapa_hash}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                }
              );
              return { ...etapa, processos: resProcessos.data };
            } catch (error) {
              console.error(
                `Erro ao buscar processos para etapa ${etapa.info_etapa.etapa_nome}`,
                error
              );
              return { ...etapa, processos: [] };
            }
          }
          return etapa;
        })
      );

      setEtapas(etapasComProcessos);
    } catch (err) {
      setError("Erro ao carregar etapas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/esteira-status/listar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setStatusList(res.data);
    } catch (error) {
      console.error("Erro ao carregar lista de status", error);
    }
  };

  useEffect(() => {
    fetchEtapas();
    fetchStatus();
  }, [esteiraHash]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEtapas((items) => {
        const oldIndex = items.findIndex(
          (item) => item.relacionamento_esteira_estapa_hash === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.relacionamento_esteira_estapa_hash === over.id
        );

        const newItems = arrayMove(items, oldIndex, newIndex);

        return newItems.map((item, index) => ({
          ...item,
          indice_etapa: index + 1
        }));
      });
    }
  };

  const updateServerOrder = async () => {
    try {
      await axios.put(`${API_BASE_URL}/processo-esteira/ordem`, {
        esteira_hash: esteiraHash,
        etapas: etapas.map((e) => ({
          relacionamento_hash: e.relacionamento_esteira_estapa_hash,
          nova_ordem: e.indice_etapa
        }))
      });
      toast({
        title: "Ordem salva com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast({
        title: "Erro ao salvar ordem",
        variant: "destructive"
      });
    }
  };

  const handleCheckboxChange = async (
    acaoHash: string,
    field: string,
    currentValue: number | null
  ) => {
    const newValue = currentValue === 1 ? 0 : 1;
    setEtapas((prevEtapas) =>
      prevEtapas.map((etapa) => ({
        ...etapa,
        processos: etapa.processos?.map((processo) => {
          if (processo.dadosAcaoStatusAtual.esteira_acao_status_hash === acaoHash) {
            return {
              ...processo,
              dadosAcaoStatusAtual: {
                ...processo.dadosAcaoStatusAtual,
                [field]: newValue
              }
            };
          }
          return processo;
        })
      }))
    );
  };

  const StatusCombobox = ({
    value,
    placeholder,
    disabled = false,
    field,
    acaoHash,
    onValueChange
  }: {
    value: string;
    placeholder: string;
    disabled?: boolean;
    field: string;
    acaoHash: string;
    onValueChange: (acaoHash: string, field: string, newValue: string) => void;
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}>
            {value
              ? statusList.find((status) => status.status_hash === value)?.status_nome ||
                placeholder
              : placeholder}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar status..." className="h-9" />
            <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value=""
                onSelect={() => {
                  onValueChange(acaoHash, field, "");
                  setOpen(false);
                }}>
                Nenhum
                <CheckIcon
                  className={cn("ml-auto h-4 w-4", value === "" ? "opacity-100" : "opacity-0")}
                />
              </CommandItem>
              {statusList.map((status) => (
                <CommandItem
                  key={status.status_hash}
                  value={status.status_hash}
                  onSelect={(currentValue) => {
                    onValueChange(acaoHash, field, currentValue);
                    setOpen(false);
                  }}>
                  {status.status_nome}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === status.status_hash ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const filteredEtapas = etapas
    .filter((e) => e.info_etapa.etapa_visualiza === 1)
    .filter((e) => e.info_etapa.etapa_nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.indice_etapa - b.indice_etapa);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card>
      <CardHeader className="mb-6 flex items-center justify-between">
        <CardTitle>
          Gerenciamento de Etapas: <span className="text-primary">{esteiraData}</span>
        </CardTitle>
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
      </CardHeader>

      <CardContent className="mb-6 flex justify-between">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Buscar etapa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={updateServerOrder}>Salvar Ordem</Button>
        </div>
      </CardContent>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}>
        <SortableContext
          items={filteredEtapas.map((e) => e.relacionamento_esteira_estapa_hash)}
          strategy={verticalListSortingStrategy}>
          <div className="mx-6 grid grid-cols-1 gap-4">
            {filteredEtapas.map((etapa) => (
              <div
                key={etapa.relacionamento_esteira_estapa_hash}
                id={etapa.relacionamento_esteira_estapa_hash}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{etapa.info_etapa.etapa_nome}</h3>
                      <p className="text-sm">Ordem: {etapa.indice_etapa}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        etapa.info_etapa.etapa_situacao === "0"
                          ? "bg-yellow-200 text-yellow-800"
                          : etapa.info_etapa.etapa_situacao === "1"
                            ? "bg-orange-200 text-orange-800"
                            : "bg-green-200 text-green-800"
                      }`}>
                      {getStatusText(etapa.info_etapa.etapa_situacao)}
                    </span>
                  </div>

                  {etapa.processos && etapa.processos.length > 0 && (
                    <div className="mt-4 space-y-6">
                      {etapa.processos.map((processo) => (
                        <div
                          key={processo.dadosStatusEtapa.status_hash}
                          className="rounded bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{processo.dadosStatusEtapa.status_nome}</p>
                              {processo.dadosAcaoStatusAtual.processo_nome && (
                                <p className="text-sm text-gray-600">
                                  {processo.dadosAcaoStatusAtual.processo_nome}
                                </p>
                              )}
                            </div>
                            <span className="rounded bg-gray-200 px-2 py-1 text-xs">
                              {processo.dadosStatusEtapa.status_tipo === "AND" ? "AND" : "OR"}
                            </span>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-md mb-2 font-semibold">Configuração de Status</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Status Atual:</Label>
                                <StatusCombobox
                                  value={
                                    processo.dadosAcaoStatusAtual.esteira_acao_status_atual || ""
                                  }
                                  placeholder="Selecione um status"
                                  field="esteira_acao_status_atual"
                                  acaoHash={processo.dadosAcaoStatusAtual.esteira_acao_status_hash}
                                  onValueChange={handleLocalStatusChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Status Aprovação:</Label>
                                <StatusCombobox
                                  value={
                                    processo.dadosAcaoStatusAtual.esteira_acao_status_aprova || ""
                                  }
                                  placeholder="Nenhum"
                                  field="esteira_acao_status_aprova"
                                  acaoHash={processo.dadosAcaoStatusAtual.esteira_acao_status_hash}
                                  onValueChange={handleLocalStatusChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Status Reprovação:</Label>
                                <StatusCombobox
                                  value={
                                    processo.dadosAcaoStatusAtual.esteira_acao_status_reprova || ""
                                  }
                                  placeholder="Nenhum"
                                  field="esteira_acao_status_reprova"
                                  acaoHash={processo.dadosAcaoStatusAtual.esteira_acao_status_hash}
                                  onValueChange={handleLocalStatusChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Status Pendência:</Label>
                                <StatusCombobox
                                  value={
                                    processo.dadosAcaoStatusAtual.esteira_acao_status_pendencia ||
                                    ""
                                  }
                                  placeholder="Nenhum"
                                  field="esteira_acao_status_pendencia"
                                  acaoHash={processo.dadosAcaoStatusAtual.esteira_acao_status_hash}
                                  onValueChange={handleLocalStatusChange}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Seção modificada para usar dropdown */}
                          <div className="mt-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  Configurações Avançadas
                                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-[var(--radix-dropdown-menu-trigger-width)] max-w-full p-4"
                                align="start"
                                sideOffset={5}>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div className="min-w-0">
                                    <h4 className="text-md mb-2 font-semibold">
                                      Opções de Notificação
                                    </h4>
                                    <div className="flex flex-col items-start space-y-2">
                                      <div className="flex space-x-4">
                                        <Button
                                          variant="outline"
                                          className={`flex items-center space-x-2 ${
                                            selectedNotifications.includes("cadastro")
                                              ? "bg-red-500 text-white"
                                              : ""
                                          }`}
                                          onClick={() => handleNotificationToggle("cadastro")}>
                                          {selectedNotifications.includes("cadastro") ? (
                                            <EnvelopeOpenIcon className="h-4 w-4" />
                                          ) : (
                                            <EnvelopeClosedIcon className="h-4 w-4" />
                                          )}
                                          <span>Cadastro PEN</span>
                                        </Button>

                                        <Button
                                          variant="outline"
                                          className={`flex items-center space-x-2 ${
                                            selectedNotifications.includes("responsavel")
                                              ? "bg-red-500 text-white"
                                              : ""
                                          }`}
                                          onClick={() => handleNotificationToggle("responsavel")}>
                                          {selectedNotifications.includes("responsavel") ? (
                                            <PersonIcon className="h-4 w-4" />
                                          ) : (
                                            <AvatarIcon className="h-4 w-4" />
                                          )}
                                          <span>Responsável</span>
                                        </Button>

                                        <Button
                                          variant="outline"
                                          className={`flex items-center space-x-2 ${
                                            selectedNotifications.includes("aprovar")
                                              ? "bg-red-500 text-white"
                                              : ""
                                          }`}
                                          onClick={() => handleNotificationToggle("aprovar")}>
                                          {selectedNotifications.includes("aprovar") ? (
                                            <CheckCircledIcon className="h-4 w-4" />
                                          ) : (
                                            <CircleIcon className="h-4 w-4" />
                                          )}
                                          <span>Aprovar</span>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-md mb-2 font-semibold">
                                      Ações Disponíveis
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={
                                            processo.dadosAcaoStatusAtual.esteira_acao_paradinha ===
                                            1
                                          }
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_status_hash,
                                              "esteira_acao_paradinha",
                                              processo.dadosAcaoStatusAtual.esteira_acao_paradinha
                                            )
                                          }
                                        />
                                        <Label>Paradinha</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={
                                            processo.dadosAcaoStatusAtual.esteira_acao_reinicio ===
                                            1
                                          }
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_status_hash,
                                              "esteira_acao_reinicio",
                                              processo.dadosAcaoStatusAtual.esteira_acao_reinicio
                                            )
                                          }
                                        />
                                        <Label>Reinício</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={
                                            processo.dadosAcaoStatusAtual
                                              .esteira_acao_edita_cadastro === 1
                                          }
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_status_hash,
                                              "esteira_acao_edita_cadastro",
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_edita_cadastro
                                            )
                                          }
                                        />
                                        <Label>Edita Cadastro</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={
                                            processo.dadosAcaoStatusAtual
                                              .esteira_acao_anexa_arquivo === 1
                                          }
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_status_hash,
                                              "esteira_acao_anexa_arquivo",
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_anexa_arquivo
                                            )
                                          }
                                        />
                                        <Label>Anexa Arquivo</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={
                                            processo.dadosAcaoStatusAtual
                                              .esteira_acao_resolve_pendencia === 1
                                          }
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_status_hash,
                                              "esteira_acao_resolve_pendencia",
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_resolve_pendencia
                                            )
                                          }
                                        />
                                        <Label>Resolve Pendência</Label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Card>
  );
};

function getStatusText(situacao: string): string {
  switch (situacao) {
    case "0":
      return "Pendente";
    case "1":
      return "Em Andamento";
    case "2":
      return "Finalizado";
    default:
      return "Desconhecido";
  }
}

export default ProcessoEsteiraViewer;
