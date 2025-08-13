"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ComboboxProps<T> = {
  data: T[];
  displayField: keyof T;
  value: T | null;
  onChange: (item: T) => void;
  label?: string;
  placeholder?: string;
  searchFields?: (keyof T)[];
  className?: string;
  dropdownClassName?: string;
};

export function Combobox<T extends Record<string, any>>({
  data,
  displayField,
  value,
  onChange,
  label,
  placeholder = "Selecione",
  searchFields = [displayField],
  className,
  dropdownClassName,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredData = React.useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const fieldValue = String(item[field] ?? "").toLowerCase();
        return fieldValue.includes(lowerSearch);
      })
    );
  }, [data, search, searchFields]);

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && <Label className="text-sm">{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full"
          >
            {value ? value[displayField] : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            dropdownClassName
          )}
        >
          <Command>
            <CommandInput
              placeholder="Buscar..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredData.map((item, index) => (
                <CommandItem
                  key={item.id ?? `${item[displayField]}-${index}`} // Usar id se disponível, senão combinar displayField com índice
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.[displayField] === item[displayField]
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item[displayField]}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}