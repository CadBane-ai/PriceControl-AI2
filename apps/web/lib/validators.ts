import { z } from "zod"

import { findOptionById, isModelIdAllowed } from "@/lib/models"

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Server registration schema alias (Story 1.4)
export const registerSchema = signupSchema

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message content is required"),
  id: z.string().optional(),
})

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
    conversationId: z.string().min(1).optional(),
    mode: z.enum(["instruct", "reasoning"]).optional(),
    model: z.string().min(1).trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.model && !isModelIdAllowed(data.model)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unsupported model selection",
        path: ["model"],
      })
    }

    if (data.model) {
      const option = findOptionById(data.model)
      if (!option) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Model configuration missing",
          path: ["model"],
        })
      } else if (data.mode && option.mode && option.mode !== data.mode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Model is not compatible with ${data.mode} mode`,
          path: ["mode"],
        })
      }
    }
  })

export type SignupFormData = z.infer<typeof signupSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChatRequestFormData = z.infer<typeof chatRequestSchema>
