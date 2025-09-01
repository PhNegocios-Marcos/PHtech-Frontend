"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  idField?: keyof T; // ✅ New optional prop for unique ID field
};

export function Combobox<T extends Record<string, any>>({
  data,
  displayField,
  value,
  onChange,
  label,
  placeholder = "Selecione",
  searchFields = [displayField],
  idField = "id" as keyof T // ✅ Default to 'id' if available
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // ✅ Smart key generation - tries to use idField, falls back to index if not unique
  const getItemKey = (item: T, index: number): string => {
    if (idField && item[idField] !== undefined) {
      return String(item[idField]);
    }
    
    // Fallback: use displayField + index to ensure uniqueness
    return `${String(item[displayField])}-${index}`;
  };

  // ✅ Smart value comparison - tries to use idField, falls back to displayField
  const isItemSelected = (item: T): boolean => {
    if (value && idField && value[idField] !== undefined && item[idField] !== undefined) {
      return value[idField] === item[idField];
    }
    return value?.[displayField] === item[displayField];
  };

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
    <div className="grid gap-1.5">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between">
            {value ? value[displayField] : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-50 w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Buscar..." value={search} onValueChange={setSearch} />
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup className="max-h-50 overflow-y-auto">
              {filteredData.map((item, index) => (
                <CommandItem
                  key={getItemKey(item, index)} // ✅ Uses smart key generation
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className="cursor-pointer">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isItemSelected(item) ? "opacity-100" : "opacity-0" // ✅ Uses smart comparison
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