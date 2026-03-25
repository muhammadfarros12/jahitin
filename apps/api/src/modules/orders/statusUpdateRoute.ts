import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { OrderStatus } from "../../generated/prisma/enums";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../utils/prisma";
import { updateStatusSchema } from "./statusUpdateSchema";

export const statusUpdateRouter = new Hono<{
	Variables: {
		user: number;
	};
}>()
	.use("*", authMiddleware)
	.post(
		"/orders/:id/status-updates",
		zValidator("json", updateStatusSchema),
		async (context) => {
			const orderId = context.req.param("id");
			const userId = context.get("user");
			const body = context.req.valid("json");

			try {
				const existingOrder = await prisma.order.findUnique({
					where: {
						id: Number(orderId),
					},
				});

				if (!existingOrder) {
					throw new HTTPException(404, { message: "Order not found" });
				}

				if (body.status === OrderStatus.PENDING) {
					const result = await prisma.$transaction(
						async (transactionClient) => {
							const statusUpdate =
								await transactionClient.orderStatusUpdate.create({
									data: {
										order_id: Number(orderId),
										status: body.status,
										notes: body.notes,
										created_by: userId,
									},
								});

							await transactionClient.order.update({
								where: { id: Number(orderId) },
								data: {
									current_status: body.status,
									updated_at: new Date(),
								},
							});

							const isResolved = body.is_resolved === true;

							const productionIssue =
								await transactionClient.productionIssue.upsert({
									where: { order_id: Number(orderId) },
									update: {
										previous_status: existingOrder.current_status,
										issue_description: body.issue_description || "",
										solution: body.solution || "",
										adjust_finished_date: body.adjust_finished_date
											? new Date(body.adjust_finished_date)
											: null,
										is_resolved: isResolved,
										resolved_at: isResolved ? new Date() : null,
										resolved_by: isResolved ? userId : null,
										updated_at: new Date(),
									},
									create: {
										order_id: Number(orderId),
										previous_status: existingOrder.current_status,
										issue_description: body.issue_description || "",
										solution: body.solution || "",
										adjust_finished_date: body.adjust_finished_date
											? new Date(body.adjust_finished_date)
											: null,
										is_resolved: isResolved,
										resolved_at: isResolved ? new Date() : null,
										resolved_by: isResolved ? userId : null,
									},
								});

							return { statusUpdate, productionIssue };
						},
					);
					return context.json(
						{
							success: true,
							data: {
								statusUpdate: result.statusUpdate,
								productionIssue: result.productionIssue,
							},
						},
						201,
					);
				}

				const result = await prisma.$transaction(async (transactionClient) => {
					const statusUpdate = await transactionClient.orderStatusUpdate.create(
						{
							data: {
								order_id: Number(orderId),
								status: body.status,
								notes: body.notes,
								created_by: userId,
							},
						},
					);
					await transactionClient.order.update({
						where: { id: Number(orderId) },
						data: {
							current_status: body.status,
							updated_at: new Date(),
						},
					});
					return { statusUpdate };
				});
				return context.json(
					{
						success: true,
						data: {
							status_update: result.statusUpdate,
						},
					},
					201,
				);
			} catch (error) {
				if (error instanceof HTTPException) {
					throw error;
				}
				console.error(error);
				throw new HTTPException(500, { message: "Failed to update status" });
			}
		},
	);
