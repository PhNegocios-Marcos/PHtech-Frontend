'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ComboboxProps<T> = {
  data?: T[];
  displayField: keyof T;
  value: T | null;
  onChange: (item: T) => void;
  label?: string;
  placeholder?: string;
  searchFields?: (keyof T)[];
  valueField: any;
};

export function Combobox<T extends Record<string, any>>({
  data = [],
  displayField,
  value,
  onChange,
  label,
  placeholder = 'Selecione',
  searchFields = [displayField],
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredData = React.useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const fieldValue = String(item[field] ?? '').toLowerCase();
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
            className="justify-between"
          >
            {value ? value[displayField] : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredData.map(item => (
                <CommandItem
                  key={String(item[displayField])}
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value?.[displayField] === item[displayField] ? 'opacity-100' : 'opacity-0'
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