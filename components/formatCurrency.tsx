import React from "react";

// Function to format any number or string into Brazilian Reais (BRL)
export const formatToBRL = (value: number | string | null | undefined): string => {
  // Handle null or undefined
  if (value == null) {
    return "R$ 0,00";
  }

  // Convert to string and remove non-numeric characters except dot and comma
  let cleanedValue = String(value).replace(/[^\d.,-]/g, "");

  // Replace comma with dot for decimal parsing (e.g., "1,234.56" -> "1234.56")
  cleanedValue = cleanedValue.replace(",", ".");

  // Convert to number, handling potential multiple dots
  const numericValue = parseFloat(cleanedValue.replace(/\.+/g, ".")) || 0;

  // Format using Intl.NumberFormat for BRL
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

// Example React component demonstrating the usage of formatToBRL
const CurrencyFormatter: React.FC = () => {
  // Example inputs to test the formatter
  const testValues = [
    1234,
    "1234",
    1234.567,
    "1,234.56",
    "1234,567",
    "-1234.56",
    "abc1234.56def",
    null,
    undefined,
    "",
    "1.234,56",
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Formatador de Reais</h1>
      <ul className="space-y-2">
        {testValues.map((value, index) => (
          <li key={index} className="text-lg">
            <span className="font-semibold">Entrada: {String(value)}</span> →{" "}
            <span className="text-green-600">{formatToBRL(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyFormatter;