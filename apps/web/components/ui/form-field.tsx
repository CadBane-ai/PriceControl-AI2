"use client"

import type React from "react"
import { Children, cloneElement, forwardRef, isValidElement, useId } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, children, ...props }, ref) => {
    const generatedId = useId()
    let controlId = generatedId

    const enhancedChildren = Children.map(children, (child, index) => {
      if (!isValidElement(child)) {
        return child
      }

      if (index > 0) {
        return child
      }

      const existingId = child.props.id as string | undefined
      const childName = child.props.name as string | undefined
      const finalId = existingId ?? childName ?? generatedId
      controlId = finalId

      const describedBy = [
        child.props["aria-describedby"] as string | undefined,
        error ? `${finalId}-error` : undefined,
      ]
        .filter(Boolean)
        .join(" ")
        .trim()

      return cloneElement(child, {
        id: finalId,
        "aria-invalid": error ? true : child.props["aria-invalid"],
        "aria-describedby": describedBy.length > 0 ? describedBy : undefined,
        required: required ?? child.props.required,
        "aria-required": required ?? child.props["aria-required"],
      })
    })

    const errorId = error ? `${controlId}-error` : undefined

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label className="text-sm font-medium" htmlFor={controlId}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        {enhancedChildren}
        {error && (
          <p className="text-sm text-destructive" role="alert" id={errorId}>
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = "FormField"

export { FormField }
