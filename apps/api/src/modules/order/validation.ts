import { z } from "zod";

export const createOrderValidation = z.object({
	admin_id: z.string().uuid(),
	order_code: z.string().min(1),
	client_name: z.string().min(1),
	order_description: z.string().optional(),
	current_status: z.string(),
	estimated_finish_date: z.string().datetime().optional(),
	is_picked_up: z.boolean().optional(),
});

export const updateOrderValidation = createOrderValidation.partial();
