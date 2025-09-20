import { describe, expect, it } from "vitest"

import {
  OPENROUTER_MODELS,
  OPENROUTER_MODEL_GROUPS,
  findOptionById,
  inferModeFromModelId,
  isModelIdAllowed,
  resolveModelForMode,
} from "@/lib/models"

describe("Model configuration", () => {
  it("resolves defaults for instruct and reasoning modes", () => {
    expect(resolveModelForMode("instruct")).toBe(OPENROUTER_MODELS.instruct.id)
    expect(resolveModelForMode("reasoning")).toBe(OPENROUTER_MODELS.reasoning.id)
    expect(resolveModelForMode(undefined)).toBe(OPENROUTER_MODELS.instruct.id)
  })

  it("confirms configured options are discoverable and allowed", () => {
    const sampleOption = OPENROUTER_MODEL_GROUPS.flatMap((group) => group.options)[0]
    expect(sampleOption).toBeDefined()
    expect(isModelIdAllowed(sampleOption.id)).toBe(true)
    expect(findOptionById(sampleOption.id)).toEqual(sampleOption)
  })

  it("infers mode from model identifiers when available", () => {
    const reasoningOption =
      OPENROUTER_MODEL_GROUPS.flatMap((group) => group.options).find((opt) => opt.mode === "reasoning")
    const instructOption =
      OPENROUTER_MODEL_GROUPS.flatMap((group) => group.options).find((opt) => opt.mode === "instruct")

    if (!reasoningOption || !instructOption) {
      throw new Error("Expected both reasoning and instruct options in configuration")
    }

    expect(inferModeFromModelId(reasoningOption.id)).toBe("reasoning")
    expect(inferModeFromModelId(instructOption.id)).toBe("instruct")
    expect(isModelIdAllowed("non-existent")).toBe(false)
  })
})
