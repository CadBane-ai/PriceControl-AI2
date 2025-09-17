import { describe, it, expect } from "vitest"

import { OPENROUTER_MODEL_GROUPS, OPENROUTER_MODELS, findOptionById, resolveModelForMode } from "../models"

describe("OpenRouter model configuration", () => {
  const allModelIds = OPENROUTER_MODEL_GROUPS.flatMap((group) => group.options.map((option) => option.id))

  it("lists all Cerebras production models we support", () => {
    expect(allModelIds).toContain("meta-llama/llama-3.3-8b-instruct")
    expect(allModelIds).toContain("meta-llama/llama-3.3-70b-instruct")
    expect(allModelIds).toContain("meta-llama/llama-3.1-8b-instruct")
    expect(allModelIds).toContain("meta-llama/llama-3.1-70b-instruct")
  })

  it("returns sensible defaults for each chat mode", () => {
    expect(resolveModelForMode("instruct")).toBe(OPENROUTER_MODELS.instruct.id)
    expect(resolveModelForMode("reasoning")).toBe(OPENROUTER_MODELS.reasoning.id)
    expect(resolveModelForMode(undefined)).toBe(OPENROUTER_MODELS.instruct.id)
  })

  it("exposes option metadata lookups", () => {
    const option = findOptionById("meta-llama/llama-3.3-70b-instruct")
    expect(option?.label).toContain("Llama 3.3 70B")
    expect(option?.mode).toBe("reasoning")
  })
})
