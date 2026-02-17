import { z } from "zod";

export const adminSchema = z.object({
	email: z.string().email("Email tidak valid"),
	password: z.string().min(8, "Password Admin minimal 8 karakter"),
});
