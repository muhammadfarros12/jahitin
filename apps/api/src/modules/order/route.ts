import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { prisma } from "../../utils/prisma.js";
import { createOrderValidation, updateOrderValidation } from "./validation.js";

export const orderRoute = new Hono()

	.get("/", async (c) => {
		try {
			const orders = await prisma.order.findMany({
				orderBy: {
					created_at: "desc",
				},
			});

			return c.json({ data: orders });
		} catch (error) {
			console.error("Failed to list orders", error);
			return c.json({ message: "Failed to retrieve orders" }, 500);
		}
	})

	.get("/:id", async (c) => {
		const id = c.req.param("id");

		try {
			const order = await prisma.order.findFirst({
				where: { id },
			});

			return c.json({ data: order });
		} catch (error) {
			console.error(`Failed to get order with id=${id}`, error);
			return c.json({ message: "Failed to retrieve order" }, 500);
		}
	})

	.post("/", zValidator("json", createOrderValidation), async (c) => {
		const body = c.req.valid("json");

		try {
			const newOrder = await prisma.order.create({
				data: {
					admin_id: body.admin_id,
					order_code: body.order_code,
					client_name: body.client_name,
					order_description: body.order_description,
					current_status: body.current_status,
					estimated_finish_date: body.estimated_finish_date
						? new Date(body.estimated_finish_date)
						: undefined,
					is_picked_up: body.is_picked_up ?? false,
				},
			});

			return c.json({
				data: newOrder,
				message: "Order created successfully",
			});
		} catch (error) {
			console.error("Failed to create order", error);
			return c.json({ message: "Failed to create order" }, 500);
		}
	})

	.patch("/:id", zValidator("json", updateOrderValidation), async (c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");

		try {
			const updatedOrder = await prisma.order.update({
				where: { id },
				data: {
					admin_id: body.admin_id,
					order_code: body.order_code,
					client_name: body.client_name,
					order_description: body.order_description,
					current_status: body.current_status,
					estimated_finish_date: body.estimated_finish_date
						? new Date(body.estimated_finish_date)
						: undefined,
					is_picked_up: body.is_picked_up,
				},
			});

			return c.json({
				data: updatedOrder,
				message: "Order updated successfully",
			});
		} catch (error) {
			console.error(`Failed to update order with id=${id}`, error);
			return c.json({ message: "Failed to update order" }, 500);
		}
	})

	.delete("/:id", async (c) => {
		const id = c.req.param("id");

		try {
			await prisma.order.delete({
				where: { id },
			});

			return c.json({ message: "Order deleted successfully" });
		} catch (error) {
			console.error(`Failed to delete order with id=${id}`, error);
			return c.json({ message: "Failed to delete order" }, 500);
		}
	});
