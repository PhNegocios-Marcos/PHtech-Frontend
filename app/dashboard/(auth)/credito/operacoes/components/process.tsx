import { Progress } from "@/components/ui/progress";
import { FileEdit, CheckCircle, PenLine, Wallet, IdCard } from "lucide-react";



export function ProcessStepper() {
  const steps = [
    { id: 1, name: "Rascunho", icon: <FileEdit className="w-6 h-6" />, date: "08/04/2025, 10:36", completed: true },
    { id: 2, name: "Aprovação", icon: <IdCard className="w-6 h-6" />, completed: true },
    { id: 3, name: "Assinatura", icon: <PenLine className="w-6 h-6" />, completed: false },
    { id: 4, name: "Liquidação", icon: <Wallet className="w-6 h-6" />, completed: false },
    { id: 5, name: "Encerrado", icon: <CheckCircle className="w-6 h-6" />, completed: false },
  ];

  return (
    <div className="w-full p-6">
      {/* Barra de progresso (shadcn/ui) */}
      <Progress value={40} className="h-1 bg-gray-200 mb-8" /> {/* 40% = 2/5 etapas concluídas */}

      {/* Etapas */}
      <div className="flex justify-between relative">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center z-10">
            {/* Círculo da etapa */}
            <div
              className={`w-16 h-16 rounded-sm flex items-center justify-center font-bold ${
                step.completed
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.icon}
            </div>
            {/* Nome da etapa */}
            <span className="mt-2 text-sm font-medium">{step.name}</span>
            {/* Data (se existir) */}
            {step.date && (
              <span className="text-xs text-gray-500 mt-1">{step.date}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}