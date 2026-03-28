import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../utils/prisma";
import { updateOrderIssueSchema } from "./orderIssueSchema";

export const orderIssueRouter = new Hono<{ Variables: { user: number } }>()
	.use("*", authMiddleware)
	.patch(
		"/orders/:id/issue",
		zValidator("json", updateOrderIssueSchema),
		async (c) => {
			const userId = c.get("user");
			const orderId = Number(c.req.param("id"));
			const body = c.req.valid("json");

			try {
				const existingIssue = await prisma.productionIssue.findFirst({
					where: {
						order_id: orderId,
						is_resolved: false,
					},
				});

				if (!existingIssue) {
					throw new HTTPException(404, {
						message: "Unresolved production issue not found",
					});
				}

				const result = await prisma.$transaction(async (tx) => {
					const updatedIssue = await tx.productionIssue.update({
						where: { id: existingIssue.id },
						data: {
							solution: body.solution,
							is_resolved: true,
							resolved_at: new Date(),
							resolved_by: userId,
							updated_at: new Date(),
						},
					});

					await tx.orderStatusUpdate.create({
						data: {
							order_id: orderId,
							status: existingIssue.previous_status,
							notes: `Issue resolved: ${body.solution || "Selesai"}`,
							created_by: userId,
						},
					});

					const updatedOrder = await tx.order.update({
						where: { id: orderId },
						data: { current_status: existingIssue.previous_status },
					});

					return { updatedIssue, updatedOrder };
				});

				return c.json(
					{
						success: true,
						data: {
							issue: result.updatedIssue,
							order: result.updatedOrder,
						},
						message: "Production issue resolved successfully",
					},
					200,
				);
			} catch (error) {
				if (error instanceof HTTPException) throw error;
				console.error(error);
				throw new HTTPException(400, {
					message: "Failed to update production issue",
				});
			}
		},
	)
	.get("/orders/:id/issue", async (c) => {
		const orderId = Number(c.req.param("id"));

		try {
			const issues = await prisma.productionIssue.findMany({
				where: { order_id: orderId },
				include: {
					resolver: { select: { name: true } },
				},
				orderBy: { created_at: "desc" },
			});

			if (issues.length === 0) {
				throw new HTTPException(404, {
					message: "Production issues not found",
				});
			}

			return c.json(
				{
					success: true,
					data: issues,
				},
				200,
			);
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			console.error(error);
			throw new HTTPException(400, {
				message: "Failed to fetch production issue",
			});
		}
	});
