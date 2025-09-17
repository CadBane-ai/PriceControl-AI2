export type ChatMode = "instruct" | "reasoning";

export interface ModelOption {
  id: string
  label: string
  description?: string
  tooltip?: string
  mode?: ChatMode // optional hint to infer mode when this id is selected
}

export interface ModelGroup {
  key: string
  label: string
  options: ModelOption[]
}

// Centralized model configuration for OpenRouter (Cerebras provider).
// Adjust groups/options below to customize what users see in the picker.
export const OPENROUTER_MODEL_GROUPS: ModelGroup[] = [
  {
    key: "cerebras-fast",
    label: "Cerebras • Fast & Cost-Efficient",
    options: [
      {
        id: "meta-llama/llama-3.3-8b-instruct",
        label: "Llama 3.3 8B Instruct",
        description: "Production 8B instruct model tuned by Cerebras; great everyday default.",
        tooltip: "Fastest and lowest cost option.",
        mode: "instruct",
      },
      {
        id: "meta-llama/llama-3.1-8b-instruct",
        label: "Llama 3.1 8B Instruct",
        description: "Previous generation 8B maintained for compatibility checks.",
        tooltip: "Choose when mirroring earlier releases.",
        mode: "instruct",
      },
    ],
  },
  {
    key: "cerebras-advanced",
    label: "Cerebras • Advanced Reasoning",
    options: [
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        label: "Llama 3.3 70B Instruct",
        description: "Flagship reasoning-grade model with improved alignment and context.",
        tooltip: "Best balance of depth and latency.",
        mode: "reasoning",
      },
      {
        id: "meta-llama/llama-3.1-70b-instruct",
        label: "Llama 3.1 70B Instruct",
        description: "Battle-tested 70B model; reliable fallback if newer versions throttle.",
        tooltip: "Use when 3.3 variants are unavailable.",
        mode: "reasoning",
      },
      {
        id: "meta-llama/llama-3.1-405b-instruct",
        label: "Llama 3.1 405B Instruct",
        description: "Ultra-capable 405B deployment running on Cerebras clusters.",
        tooltip: "Highest quality and cost; expect longer latency.",
        mode: "reasoning",
      },
    ],
  },
]

export function findOptionById(id?: string): ModelOption | undefined {
  if (!id) return undefined
  for (const g of OPENROUTER_MODEL_GROUPS) {
    const found = g.options.find((o) => o.id === id)
    if (found) return found
  }
  return undefined
}

const DEFAULT_INSTRUCT_MODEL_ID = "meta-llama/llama-3.3-8b-instruct"
const DEFAULT_REASONING_MODEL_ID = "meta-llama/llama-3.3-70b-instruct"

const DEFAULT_INSTRUCT_OPTION =
  findOptionById(DEFAULT_INSTRUCT_MODEL_ID) ?? OPENROUTER_MODEL_GROUPS[0]?.options[0]
const DEFAULT_REASONING_OPTION =
  findOptionById(DEFAULT_REASONING_MODEL_ID) ??
  findOptionById(DEFAULT_INSTRUCT_MODEL_ID) ??
  OPENROUTER_MODEL_GROUPS.flatMap((group) => group.options)[0]

// Convenience mapping for default mode → model selection
export const OPENROUTER_MODELS: Record<ChatMode, { id: string; label: string }> = {
  instruct: {
    id: DEFAULT_INSTRUCT_OPTION?.id ?? DEFAULT_INSTRUCT_MODEL_ID,
    label: DEFAULT_INSTRUCT_OPTION?.label ?? DEFAULT_INSTRUCT_MODEL_ID,
  },
  reasoning: {
    id: DEFAULT_REASONING_OPTION?.id ?? DEFAULT_REASONING_MODEL_ID,
    label: DEFAULT_REASONING_OPTION?.label ?? DEFAULT_REASONING_MODEL_ID,
  },
}

export function resolveModelForMode(mode: ChatMode | undefined): string {
  if (!mode) return OPENROUTER_MODELS.instruct.id
  return OPENROUTER_MODELS[mode]?.id ?? OPENROUTER_MODELS.instruct.id
}
