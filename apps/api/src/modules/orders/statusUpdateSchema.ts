import { z } from "zod";
import { OrderStatus } from "../../generated/prisma/enums";

const baseDateSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
	.transform((val) => new Date(`${val}T00:00:00.000Z`));

// Base schema untuk update status, yang akan digunakan untuk semua status update
const baseStatusUpdateSchema = z.object({
	notes: z.string().min(1, "Notes cannot be empty").optional(),
});

// jika statusnya PENDING, maka wajib ada issue_description, solution, dan adjust_finished_date (opsional)
const pendingStatusSchema = baseStatusUpdateSchema.extend({
	status: z.literal("PENDING"),
	issue_description: z.string().min(1, "Issue description cannot be empty"),
	solution: z.string().min(1, "Solution cannot be empty"),
	adjust_finished_date: baseDateSchema.optional(),
});

// jika statusnya selain PENDING, maka tidak boleh ada issue_description, solution, dan adjust_finished_date
const nonPendingStatusSchema = baseStatusUpdateSchema.extend({
	status: z.enum([
		OrderStatus.ORDER_DITERIMA,
		OrderStatus.APPROVAL_SAMPLE,
		OrderStatus.MENUNGGU_ANTRIAN,
		OrderStatus.PRODUKSI_BERJALAN,
		OrderStatus.QUALITY_CHECK,
		OrderStatus.SIAP_DIAMBIL,
		OrderStatus.ORDER_SELESAI,
	]),
});

// discriminated union untuk memeriksa validasi base on nilai status (yang terbagi 2: pending dan selain pending)
export const updateStatusSchema = z.discriminatedUnion("status", [
	pendingStatusSchema,
	nonPendingStatusSchema,
]);

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type pendingStatusSchema = z.infer<typeof pendingStatusSchema>;
export type nonPendingStatusSchema = z.infer<typeof nonPendingStatusSchema>;
