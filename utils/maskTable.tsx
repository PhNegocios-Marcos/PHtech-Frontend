import { parse, format, parseISO, isValid } from "date-fns";

export function maskPercentage (value: any) {
    const valueMasked = value.getValue();

    return valueMasked + "%";
}

export function maskMonth (value: any) {
    const valueMasked = value.getValue();
    const complement = value !== 1 ? " meses" : " mês";

    return valueMasked + complement;
}

export function maskDate(value: any): string {
  const raw = value.getValue?.() ?? value;

  if (
    !raw || raw === "0000-00-00 00:00:00" || raw.startsWith("0000") || raw === "0001-01-01T00:00:00.000Z"
  ) {
    return "Data inválida";
  }

  try {
    const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;

    const date = new Date(normalized);

    if (!isValid(date)) return "";

    return format(date, "dd/MM/yyyy");
  } catch {
    return "";
  }
}

export function maskCPF(value: any): string {
  const onlyDigits = String(value).replace(/\D/g, "").slice(0, 11);

  return onlyDigits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}