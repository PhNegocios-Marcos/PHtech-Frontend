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
import { toast } from "sonner";
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

// Tipos de dados
interface Etapa {
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

interface TextoLimitadoProps {
  texto?: any;
  limite?: any;
  sufixo?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Configurações para os campos de status
const STATUS_FIELDS = [
  {
    field: "esteira_acao_status_atual",
    label: "Atual:",
    placeholder: "Selecione um status"
  },
  { field: "esteira_acao_status_aprova", label: "Aprovação:", placeholder: "Nenhum" },
  { field: "esteira_acao_status_reprova", label: "Reprovação:", placeholder: "Nenhum" },
  { field: "esteira_acao_status_pendencia", label: " Pendência:", placeholder: "Nenhum" }
];

// Configurações para as notificações
const NOTIFICATION_TYPES = [
  { key: "cadastro", label: "Cadastro PEN", icons: [EnvelopeOpenIcon, EnvelopeClosedIcon] },
  { key: "responsavel", label: "Responsável", icons: [PersonIcon, AvatarIcon] },
  { key: "aprovar", label: "Aprovar", icons: [CheckCircledIcon, CircleIcon] }
];

// Configurações para as ações disponíveis
const AVAILABLE_ACTIONS = [
  { field: "esteira_acao_paradinha", label: "Paradinha" },
  { field: "esteira_acao_reinicio", label: "Reinício" },
  { field: "esteira_acao_edita_cadastro", label: "Edita Cadastro" },
  { field: "esteira_acao_anexa_arquivo", label: "Anexa Arquivo" },
  { field: "esteira_acao_resolve_pendencia", label: "Resolve Pendência" }
];

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

  const TextoLimitado = ({ texto, limite, sufixo = "..." }: TextoLimitadoProps) => {
    if (!texto) return "";
    return texto.length > limite ? `${texto.slice(0, limite)}${sufixo}` : texto;
  };

  const findStatusByTruncatedText = (texto: string) => {
    return (
      statusList.find((status) => status.status_nome.slice(0, 20) === texto.slice(0, 20))
      ?.status_hash || ""
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
      toast.error("Erro ao carregar etapas", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
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
      toast.error("Erro ao carregar lista de status", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
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
          (item) => item.info_etapa.etapa_hash === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.info_etapa.etapa_hash === over.id
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
          etapa_hash: e.info_etapa.etapa_hash,
          nova_ordem: e.indice_etapa
        }))
      });
      toast.success("Ordem salva com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast.error("Erro ao salvar ordem", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
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

    const displayValue = value
      ? (statusList.find((status) => status.status_hash === value)?.status_nome || "").slice(
          0,
          20
        ) +
        (value &&
        (statusList.find((status) => status.status_hash === value)?.status_nome || "").length > 20
          ? "..."
          : "")
      : placeholder;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}>
            {displayValue}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar status..." className="h-9" />
            <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
            <CommandGroup>
              {statusList.map((status) => (
                <CommandItem
                  key={status.status_hash}
                  value={status.status_hash}
                  onSelect={() => {
                    onValueChange(acaoHash, field, status.status_hash);
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
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          Gerenciamento de Etapas: <span className="text-primary">{esteiraData}</span>
        </CardTitle>
        <Button onClick={onClose} variant="outline">
          Fechar
        </Button>
      </CardHeader>

      <CardContent className="flex justify-between">
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
          items={filteredEtapas.map((e) => e.info_etapa.etapa_hash)}
          strategy={verticalListSortingStrategy}>
          <div className="mx-6 grid grid-cols-1">
            {filteredEtapas.map((etapa) => (
              <div
                key={etapa.info_etapa.etapa_hash}
                id={etapa.info_etapa.etapa_hash}>
                {etapa.processos && etapa.processos.length > 0 && (
                  <div className="mt-4 space-y-6">
                    {etapa.processos.map((processo) => (
                      <Card key={processo.dadosStatusEtapa.status_hash} className="gap-0 p-4 shadow-lg border-3 border-solid">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {processo.dadosStatusEtapa.status_nome}{" "}
                              <span className="text-sm text-gray-600">
                                {processo.dadosAcaoStatusAtual.processo_nome}
                              </span>{" "}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              processo.dadosStatusEtapa.status_tipo === "0"
                                ? "bg-yellow-200 text-yellow-800"
                                : processo.dadosStatusEtapa.status_tipo === "1"
                                  ? "bg-orange-200 text-orange-800"
                                  : "bg-green-200 text-green-800"
                            }`}>
                            {getStatusText(processo.dadosStatusEtapa.status_tipo)}
                          </span>
                        </div>
                        <div className="">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {STATUS_FIELDS.map(({ field, label, placeholder }) => (
                              <div className="space-y-2" key={field}>
                                <Label className="text-sm font-medium">{label}</Label>
                                <StatusCombobox
                                  value={processo.dadosAcaoStatusAtual[field] || ""}
                                  placeholder={placeholder}
                                  field={field}
                                  acaoHash={processo.dadosAcaoStatusAtual.esteira_acao_status_hash}
                                  onValueChange={handleLocalStatusChange}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

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
                                      {NOTIFICATION_TYPES.map(
                                        ({ key, label, icons: [ActiveIcon, InactiveIcon] }) => (
                                          <Button
                                            key={key}
                                            variant="outline"
                                            className={`flex items-center space-x-2 ${
                                              selectedNotifications.includes(key)
                                                ? "bg-red-500 text-white"
                                                : ""
                                            }`}
                                            onClick={() => handleNotificationToggle(key)}>
                                            {selectedNotifications.includes(key) ? (
                                              <ActiveIcon className="h-4 w-4" />
                                            ) : (
                                              <InactiveIcon className="h-4 w-4" />
                                            )}
                                            <span>{label}</span>
                                          </Button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-md mb-2 font-semibold">Ações Disponíveis</h4>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                    {AVAILABLE_ACTIONS.map(({ field, label }) => (
                                      <div className="flex items-center space-x-2" key={field}>
                                        <Checkbox
                                          checked={processo.dadosAcaoStatusAtual[field] === 1}
                                          onCheckedChange={() =>
                                            handleCheckboxChange(
                                              processo.dadosAcaoStatusAtual
                                                .esteira_acao_status_hash,
                                              field,
                                              processo.dadosAcaoStatusAtual[field]
                                            )
                                          }
                                        />
                                        <Label>{label}</Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
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