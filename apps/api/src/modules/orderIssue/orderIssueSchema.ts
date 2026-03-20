import { z } from "zod";

export const updateOrderIssueSchema = z.object({
	issue_description: z
		.string()
		.min(1, "Issue description cannot be empty")
		.optional(),
	solution: z.string().min(1, "Solution must have fill"),
	adjust_finished_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
		.transform((val) => new Date(`${val}T00:00:00.000Z`))
		.optional()
		.or(z.literal("").transform(() => undefined)),
	is_resolved: z.boolean(),
});

export type UpdateOrderIssueInput = z.infer<typeof updateOrderIssueSchema>;
