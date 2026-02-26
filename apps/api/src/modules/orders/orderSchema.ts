import { z } from "zod";

export const createOrderSchema = z.object({
	customer_name: z.string().min(1, "customer name is required"),
	order_description: z.string().min(1, "order description is required"),
	estimated_finished_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
		.transform((val) => new Date(`${val}T00:00:00.000Z`)),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
	customer_name: z.string().min(1, "customer name is required").optional(),
	order_description: z
		.string()
		.min(1, "order description is required")
		.optional(),
	estimated_finished_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
		.transform((val) => new Date(`${val}T00:00:00.000Z`))
		.optional(),
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
