import { z } from "zod"


export const registerSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 character long")
})

export const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 character long")
})

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>