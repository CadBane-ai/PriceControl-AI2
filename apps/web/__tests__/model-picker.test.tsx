import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"

import { ModelPicker } from "@/components/chat/model-picker"
import { OPENROUTER_MODELS, inferModeFromModelId } from "@/lib/models"

function ControlledModelPicker() {
  const [modelId, setModelId] = useState(OPENROUTER_MODELS.instruct.id)
  const [mode, setMode] = useState(() => inferModeFromModelId(OPENROUTER_MODELS.instruct.id) ?? "instruct")

  const handleSelect = (nextId: string) => {
    setModelId(nextId)
    setMode((prev) => inferModeFromModelId(nextId) ?? prev ?? "instruct")
  }

  return <ModelPicker selectedModelId={modelId} mode={mode} onSelect={handleSelect} />
}

describe("ModelPicker component", () => {
  it("renders the current selection and updates when choosing a different model", async () => {
    const user = userEvent.setup()
    render(<ControlledModelPicker />)

    const trigger = screen.getByTestId("model-picker-trigger")
    expect(trigger).toHaveTextContent(/llama 3.3 8b instruct/i)

    await user.click(trigger)

    const reasoningOption = screen.getByTestId("model-option-meta-llama/llama-3.3-70b-instruct")
    await user.click(reasoningOption)

    expect(trigger).toHaveTextContent(/llama 3.3 70b instruct/i)
    expect(trigger).toHaveTextContent(/reasoning/i)
  })
})
