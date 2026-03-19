import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { prisma } from "../../utils/prisma";

export const publicOrderRouter = new Hono().get(
	"/track/:orderCode",
	async (c) => {
		const orderCode = c.req.param("orderCode");

		try {
			const order = await prisma.order.findUnique({
				where: { order_code: orderCode.toUpperCase() },
				select: {
					id: true,
					order_code: true,
					customer_name: true,
					order_description: true,
					estimated_finished_date: true,
					current_status: true,
					created_at: true,
					updated_at: true,
					status_updates: {
						select: {
							id: true,
							order_id: true,
							status: true,
							notes: true,
							created_at: true,
						},
						orderBy: { created_at: "asc" },
					},
				},
			});

			if (!order) {
				throw new HTTPException(404, { message: "Order not found" });
			}

			return c.json({ success: true, data: order }, 200);
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			console.error(error);
			throw new HTTPException(500, { message: "Failed to fetch order" });
		}
	},
);
