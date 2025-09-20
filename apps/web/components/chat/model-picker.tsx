"use client"

import { useMemo } from "react"
import { Check, ChevronDown, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { OPENROUTER_MODEL_GROUPS, findOptionById, type ChatMode } from "@/lib/models"

interface ModelPickerProps {
  selectedModelId: string
  mode: ChatMode
  onSelect: (modelId: string) => void
}

export function ModelPicker({ selectedModelId, mode, onSelect }: ModelPickerProps) {
  const selectedOption = useMemo(() => findOptionById(selectedModelId), [selectedModelId])
  const activeLabel = selectedOption?.label ?? "Select model"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2 h-9 px-3 text-sm"
          data-testid="model-picker-trigger"
        >
          <span className="truncate max-w-[160px]" title={activeLabel}>
            {activeLabel}
          </span>
          <Badge variant="secondary" className="h-5 px-2 text-[10px] capitalize">
            {mode}
          </Badge>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        {OPENROUTER_MODEL_GROUPS.map((group, groupIndex) => (
          <div key={group.key}>
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              {group.label}
            </DropdownMenuLabel>
            {group.options.map((option) => {
              const isSelected = option.id === selectedModelId
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => {
                    onSelect(option.id)
                  }}
                  className="py-2 text-sm"
                  data-testid={`model-option-${option.id}`}
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium leading-none">{option.label}</span>
                        {option.mode && (
                          <Badge variant="outline" className="h-4 px-1.5 text-[10px] capitalize">
                            {option.mode}
                          </Badge>
                        )}
                      </div>
                      {option.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {option.tooltip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </TooltipTrigger>
                          <TooltipContent side="left" sideOffset={8} className="max-w-xs text-xs leading-snug">
                            {option.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {isSelected && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}
            {groupIndex < OPENROUTER_MODEL_GROUPS.length - 1 && <DropdownMenuSeparator className="my-2" />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
