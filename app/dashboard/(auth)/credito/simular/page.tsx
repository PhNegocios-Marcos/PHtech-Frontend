"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "./components/Combobox"; // Supondo que você tenha um Combobox já adaptado
import Cleave from "cleave.js/react";

export default function CreditSimular() {
  const produtos = [
    { id: 1, name: "FGTS - FAIXA ÚNICA - NOVO" },
    { id: 2, name: "EXEMPLO CONSIGNADO - 2,49%" },
    { id: 3, name: "Produto C" }
  ];

  const tipoPessoa = [{ id: 1, name: "Pessoa Física" }];
  const tipoCalculo = [
    { id: 1, name: "Valor Bruto" },
    { id: 2, name: "Valor Líquido" },
    { id: 3, name: "Valor de Parcela" }
  ];
  const periodicidadePagamento = [
    { id: 1, name: "Dias" },
    { id: 2, name: "Meses" },
    { id: 3, name: "Anos" }
  ];
  const tomador = [
    { id: 1, name: "Bazinga" },
    { id: 2, name: "Outros" }
  ];
  const baseCalculo = [
    { id: 1, name: "Base 252 - Dias úteis" },
    { id: 2, name: "Base 252 - Meses x 21" },
    { id: 3, name: "Base 360 - Dias Corridos" },
    { id: 4, name: "Base 360 - Meses" },
    { id: 5, name: "Base 365 - Dias corridos" },
    { id: 6, name: "Base 365 - Meses" }
  ];
  const indexadorPosFixado = [
    { id: 1, name: "CDI" },
    { id: 2, name: "TR" },
    { id: 3, name: "INPC" },
    { id: 4, name: "IPCA" },
    { id: 5, name: "IGPM" },
    { id: 6, name: "SELIC" }
  ];
  const aniversario = [
    { id: 1, name: "Janeiro" },
    { id: 2, name: "Fevereiro" },
    { id: 3, name: "Março" },
    { id: 4, name: "Abril" },
    { id: 5, name: "Maio" },
    { id: 6, name: "Junho" },
    { id: 7, name: "Julho" },
    { id: 8, name: "Agosto" },
    { id: 9, name: "Setembro" },
    { id: 10, name: "Outubro" },
    { id: 11, name: "Novembro" },
    { id: 12, name: "Dezembro" }
  ];

  type Produto = {
    id: number;
    name: string;
  };

  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderInput = (key: string, label: string, props = {}) => (
    <div className="space-y-1">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={formValues[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        {...props}
      />
    </div>
  );

  const renderDateInput = (key: string, label: string) => (
    <div className="space-y-1">
      <Label htmlFor={key}>{label}</Label>
      <Cleave
        id={key}
        placeholder="dd/mm/yyyy"
        options={{ date: true, delimiter: "/", datePattern: ["d", "m", "Y"] }}
        value={formValues[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );

  const camposPorProduto: Record<Produto["id"], React.ReactNode> = {
    1: (
      <>
        <Combobox
          data={tipoPessoa}
          displayField="name"
          value={formValues.tipoPessoa}
          onChange={(val) => handleChange("tipoPessoa", val)}
          label="Tipo de Pessoa"
          searchFields={["name"]}
        />
        <Combobox
          data={tomador}
          displayField="name"
          value={formValues.tomador}
          onChange={(val) => handleChange("tomador", val)}
          label="Tomador"
          searchFields={["name"]}
        />
        {renderInput("cpf", "CPF")}
        {renderInput("saldoFgts", "Saldo FGTS")}
        <Combobox
          data={aniversario}
          displayField="name"
          value={formValues.aniversario}
          onChange={(val) => handleChange("aniversario", val)}
          label="Mês Aniversário"
          searchFields={["name"]}
        />
        {renderInput("taxaJuros", "Taxa de Juros (%)")}
        {renderInput("parcelas", "Parcelas Adiantadas")}
        {renderDateInput("dataInicio", "Data de Início")}
        {renderInput("corban", "CORBAN")}
      </>
    ),
    2: (
      <>
        <Combobox
          data={tipoPessoa}
          displayField="name"
          value={formValues.tipoPessoa}
          onChange={(val) => handleChange("tipoPessoa", val)}
          label="Tipo de Pessoa"
          searchFields={["name"]}
        />
        <Combobox
          data={tipoCalculo}
          displayField="name"
          value={formValues.tipoCalculo}
          onChange={(val) => handleChange("tipoCalculo", val)}
          label="Tipo de cálculo"
          searchFields={["name"]}
        />
        {renderInput("valorSolicitado", "Valor Solicitado")}
        {renderInput("taxaJurosAM", "Taxa de Juros A.M. (%)")}
        {renderInput("quantidadeParcelas", "Quantidade de parcelas")}
        {renderInput("carenciaPrincipal", "Carência de principal")}
        <Combobox
          data={baseCalculo}
          displayField="name"
          value={formValues.baseCalculo}
          onChange={(val) => handleChange("baseCalculo", val)}
          label="Base de cálculo"
          searchFields={["name"]}
        />
        {renderInput("pagamentoCada", "Pagamento à cada")}
        <Combobox
          data={periodicidadePagamento}
          displayField="name"
          value={formValues.periodicidadePagamento}
          onChange={(val) => handleChange("periodicidadePagamento", val)}
          label="Periodicidade do Pagamento"
          searchFields={["name"]}
        />
        {renderDateInput("dataInicio", "Data de Início")}
        {renderDateInput("dataPrimeiroPagamento", "Data do primeiro pagamento")}
        {renderInput("corban", "CORBAN")}
        {renderInput("garantiaFiduciaria", "Garantia fiduciária")}
        <Combobox
          data={indexadorPosFixado}
          displayField="name"
          value={formValues.indexadorPosFixado}
          onChange={(val) => handleChange("indexadorPosFixado", val)}
          label="Indexador Pós-Fixado"
          searchFields={["name"]}
        />
        {renderInput("percentualIndexador", "Percentual indexador")}
      </>
    ),
    3: renderInput("campoC", "Campo C")
  };

  return (
    <div title="Simulação de Crédito">
      <div className="grid w-full max-w-[1080px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Combobox
          data={produtos}
          displayField="name"
          value={selectedProduct}
          onChange={(val) => {
            setSelectedProduct(val);
            setFormValues({});
          }}
          label="Produto"
          placeholder="Selecione um produto"
          searchFields={["name"]}
        />
        {selectedProduct && camposPorProduto[selectedProduct.id]}
      </div>
    </div>
  );
}
