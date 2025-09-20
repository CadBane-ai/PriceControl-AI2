import { render, screen } from "@testing-library/react"

import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"

describe("FormField", () => {
  it("links label, input, and error message for accessibility", () => {
    render(
      <FormField label="Email" error="Required" required>
        <Input name="email" data-testid="email-input" />
      </FormField>,
    )

    const input = screen.getByLabelText(/Email/i)
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("id", "email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute("aria-describedby", "email-error")

    const error = screen.getByRole("alert")
    expect(error).toHaveAttribute("id", "email-error")
    expect(error).toHaveTextContent("Required")
  })

  it("falls back to generated ids when none provided", () => {
    render(
      <FormField label="Password">
        <Input type="password" data-testid="password-input" />
      </FormField>,
    )

    const input = screen.getByLabelText("Password")
    const controlId = input.getAttribute("id")
    expect(controlId).toBeTruthy()
    const label = screen.getByText("Password")
    expect(label).toHaveAttribute("for", controlId ?? undefined)
    expect(input).not.toHaveAttribute("aria-describedby")
  })
})
