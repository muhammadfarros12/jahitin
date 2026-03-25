import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../../middleware/authMiddleware";
import { generateOrderCode } from "../../utils/orderCodeGenerator";
import { prisma } from "../../utils/prisma";
import type { UpdateOrderData } from "./orderSchema";
import { createOrderSchema, updateOrderSchema } from "./orderSchema";

export const orderRouter = new Hono<{ Variables: { user: number } }>()
	.use("*", authMiddleware)
	.get("/orders/stats", async (c) => {
		try {
			const [total, production, pending, completed] = await Promise.all([
				prisma.order.count(),
				prisma.order.count({
					where: { current_status: { not: "ORDER_SELESAI" } },
				}),
				prisma.order.count({ where: { current_status: "PENDING" } }),
				prisma.order.count({ where: { current_status: "ORDER_SELESAI" } }),
			]);
			return c.json(
				{
					success: true,
					data: { total, production, pending, completed },
				},
				200,
			);
		} catch (error) {
			console.error(error);
			throw new HTTPException(400, { message: "Failed to fetch stats" });
		}
	})
	.post("/orders", zValidator("json", createOrderSchema), async (c) => {
		const userId = c.get("user");
		const body = c.req.valid("json");
		try {
			const orderCode = await generateOrderCode();
			const newOrder = await prisma.order.create({
				data: {
					order_code: orderCode,
					customer_name: body.customer_name,
					order_description: body.order_description,
					estimated_finished_date: body.estimated_finished_date,
					created_by: userId,
				},
			});
			return c.json(
				{
					status: true,
					data: newOrder,
					message: "Order created successfully",
				},
				201,
			);
		} catch (error) {
			console.error(error);
			throw new HTTPException(400, { message: "Failed to create order" });
		}
	})
	.get("/orders", async (c) => {
		const page = Number(c.req.query("page")) || 1;
		const limit = Number(c.req.query("limit")) || 10;
		const search = c.req.query("search") || "";
		const status = c.req.query("status") || "ALL";
		const sortBy = c.req.query("sortBy") || "newest";
		const skip = (page - 1) * limit;

		try {
			const where: any = {};

			if (status !== "ALL") {
				if (status === "AKTIF") {
					where.current_status = { not: "ORDER_SELESAI" };
				} else {
					where.current_status = status;
				}
			}

			if (search) {
				where.OR = [
					{ customer_name: { contains: search, mode: "insensitive" } },
					{ order_code: { contains: search, mode: "insensitive" } },
					{ order_description: { contains: search, mode: "insensitive" } },
				];
			}

			let orderBy: any = { created_at: "desc" };
			if (sortBy === "oldest") orderBy = { created_at: "asc" };
			if (sortBy === "deadline") {
				where.current_status = { not: "ORDER_SELESAI" };
				orderBy = { estimated_finished_date: "asc" };
			}
			if (sortBy === "updated") orderBy = { updated_at: "desc" };
			if (sortBy === "longest_pending") {
				where.current_status = "PENDING";
				orderBy = { production_issue: { created_at: "asc" } };
			}

			const [orderList, total] = await Promise.all([
				prisma.order.findMany({
					where,
					skip,
					take: limit,
					include: {
						status_updates: {
							include: {
								user: true,
							},
							orderBy: {
								created_at: "desc",
							},
						},
						production_issue: {
							include: {
								resolver: true,
							},
						},
						createdBy: true,
					},
					orderBy,
				}),
				prisma.order.count({ where }),
			]);
			return c.json(
				{ success: true, data: orderList, total, page, limit },
				200,
			);
		} catch (error) {
			console.error(error);
			throw new HTTPException(400, { message: "Failed to fetch order data" });
		}
	})
	.get("/orders/:id", async (c) => {
		const id = Number(c.req.param("id"));

		if (Number.isNaN(id)) {
			throw new HTTPException(400, { message: "Invalid order ID" });
		}

		try {
			const order = await prisma.order.findUnique({
				where: { id },
				include: {
					status_updates: {
						include: {
							user: true,
						},
						orderBy: {
							created_at: "desc",
						},
					},
					production_issue: {
						include: {
							resolver: true,
						},
					},
					createdBy: true,
				},
			});

			if (!order) {
				throw new HTTPException(404, { message: "Order not found" });
			}

			return c.json({ success: true, data: order }, 200);
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			console.error(error);
			throw new HTTPException(500, { message: "Failed to fetch order detail" });
		}
	})
	.patch("/orders/:id", zValidator("json", updateOrderSchema), async (c) => {
		const id = Number(c.req.param("id"));
		const body = c.req.valid("json");
		try {
			const existingOrder = await prisma.order.findUnique({ where: { id } });
			if (!existingOrder) {
				throw new HTTPException(404, { message: "Order not found" });
			}

			const updateData: UpdateOrderData = {};
			if (body.customer_name !== undefined)
				updateData.customer_name = body.customer_name;
			if (body.order_description !== undefined)
				updateData.order_description = body.order_description;
			if (body.estimated_finished_date !== undefined)
				updateData.estimated_finished_date = body.estimated_finished_date;

			if (Object.keys(updateData).length === 0) {
				throw new HTTPException(400, { message: "No data provided to update" });
			}

			const updatedOrder = await prisma.order.update({
				where: { id },
				data: updateData,
			});
			return c.json(
				{
					status: true,
					data: updatedOrder,
					message: "Order updated successfully",
				},
				200,
			);
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			console.error(error);
			throw new HTTPException(400, { message: "Failed to update order" });
		}
	})
	.delete("/orders/:id", async (c) => {
		const id = Number(c.req.param("id"));
		try {
			const existingOrder = await prisma.order.findUnique({ where: { id } });
			if (!existingOrder) {
				throw new HTTPException(404, { message: "Order not found" });
			}
			await prisma.order.delete({ where: { id } });
			return new Response(null, { status: 204 });
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			console.error(error);
			throw new HTTPException(400, { message: "Failed to delete order" });
		}
	});
