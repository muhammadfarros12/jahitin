import { z } from "zod";

export const adminSchema = z.object({
	email: z.string().email("Email tidak valid"),
	name: z.string().min(2, "Nama minimal 2 karakter").optional(),
	password: z.string().min(8, "Password Admin minimal 8 karakter"),
});
