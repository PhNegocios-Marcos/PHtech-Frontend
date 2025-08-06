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
import { SortableItem } from "./SortableItem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

interface ProcessoEsteiraViewerProps {
  esteiraHash: any;
  esteiraData: any;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ProcessoEsteiraViewer: React.FC<ProcessoEsteiraViewerProps> = ({
  esteiraData,
  esteiraHash,
  onClose
}) => {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

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

  useEffect(() => {
    const fetchEtapas = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/processo-esteira/ver/${esteiraHash}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setEtapas(res.data);
      } catch (err) {
        setError("Erro ao carregar etapas");
      } finally {
        setLoading(false);
      }
    };

    fetchEtapas();
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
      // Adicione feedback visual aqui (toast, alert, etc.)
    } catch (error) {
      // Adicione tratamento de erro aqui
    }
  };

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
        {/* <div className="flex space-x-2">
          <button className="rounded bg-blue-500 px-4 py-2 text-white">Todas</button>
          <button className="rounded bg-gray-200 px-4 py-2">Pendentes</button>
          <button className="rounded bg-green-500 px-4 py-2 text-white">Finalizadas</button>
        </div> */}

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Buscar etapa..."
            // value={globalFilter}
            // onChange={(event) => setGlobalFilter(event.target.value)}
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
          items={etapas
            .filter((e) => e.info_etapa.etapa_visualiza === 1)
            .map((e) => e.relacionamento_esteira_estapa_hash)}
          strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 mx-6">
            {etapas
              .filter((e) => e.info_etapa.etapa_visualiza === 1)
              .sort((a, b) => a.indice_etapa - b.indice_etapa)
              .map((etapa) => (
                <SortableItem
                  key={etapa.relacionamento_esteira_estapa_hash}
                  id={etapa.relacionamento_esteira_estapa_hash}>
                  <Card
                    className="p-4">
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

                    <div className="mt-4 flex justify-between">
                      <Button variant="outline">Editar</Button>
                      <Button>Remover</Button>
                    </div>
                  </Card>
                </SortableItem>
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </Card>
  );
};

// Funções auxiliares corrigidas
// function getColorClass(cor: string): string {
//   if (cor.startsWith("bg-")) return cor;
//   return `bg-${cor}-100 border-${cor}-300`;
// }

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
