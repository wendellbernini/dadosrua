'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import neighborhoods from '@/data/neighborhoods.json'

export interface NeighborhoodAutocompleteProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function NeighborhoodAutocomplete({
  value,
  onValueChange,
  placeholder = 'Selecione o bairro...',
  className,
}: NeighborhoodAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  // Função para filtrar bairros com busca mais precisa
  const filteredNeighborhoods = React.useMemo(() => {
    if (!searchValue.trim()) {
      return neighborhoods
    }

    const searchTerm = searchValue.toLowerCase().trim()
    return neighborhoods.filter(neighborhood => 
      neighborhood.toLowerCase().includes(searchTerm)
    )
  }, [searchValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between h-12 text-base', className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar bairro..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Nenhum bairro encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredNeighborhoods.map((neighborhood) => (
                <CommandItem
                  key={neighborhood}
                  value={neighborhood}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? '' : currentValue)
                    setOpen(false)
                    setSearchValue('')
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === neighborhood ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {neighborhood}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
