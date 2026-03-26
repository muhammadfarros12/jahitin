import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../utils/prisma";
import { adminSchema, updateUserSchema } from "./schema";

interface Context {
	Variables: {
		user: {
			id: number;
			email: string;
			name: string;
		};
	};
}

export const userRouter = new Hono<Context>()
	.use(authMiddleware)
	.post("/create", zValidator("json", adminSchema), async (c) => {
		const { name, email, password } = c.req.valid("json");

		const checkUser = await prisma.user.findFirst({ where: { name } });
		if (checkUser)
			throw new HTTPException(400, { message: "Username already exists" });

		const hashPassword = await bcrypt.hash(password, 10);

		const newAdmin = await prisma.user.create({
			data: {
				name,
				email,
				role: "ADMIN",
				password: hashPassword,
			},
		});

		return c.json({
			message: "Admin created successfully",
			data: {
				id: newAdmin.id,
				name: newAdmin.name,
				email: newAdmin.email,
				role: newAdmin.role,
			},
		});
	})

	.get("/", async (c) => {
		const admins = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});
		return c.json({ status: "success", data: admins });
	})

	.put("/:id", zValidator("json", updateUserSchema), async (c) => {
		const id = Number(c.req.param("id"));

		if (Number.isNaN(id)) {
			throw new HTTPException(400, { message: "ID User tidak valid" });
		}

		const { name, email, password } = c.req.valid("json");

		// Siapkan objek data yang akan diupdate (hanya yang dikirim saja)
		const updateData: { name?: string; email?: string; password?: string } = {};
		if (name) updateData.name = name;
		if (email) updateData.email = email;
		if (password) {
			updateData.password = await bcrypt.hash(password, 10);
		}

		try {
			const updatedUser = await prisma.user.update({
				where: { id },
				data: updateData,
				select: { id: true, name: true, email: true, role: true },
			});

			return c.json({
				status: "success",
				message: "User berhasil diperbarui",
				data: updatedUser,
			});
		} catch (error) {
			console.error(error);
			throw new HTTPException(500, { message: "Gagal memperbarui user" });
		}
	})

	.delete("/:id", async (c) => {
		const id = Number(c.req.param("id"));
		await prisma.user.delete({ where: { id } });
		return c.json({ status: "succes", message: "Admin deleted" });
	})
	.get("/profile", async (c) => {
		const userId = c.get("user");

		const user = await prisma.user.findUnique({
			where: { id: Number(userId) },
			select: { id: true, name: true, email: true, role: true },
		});

		return c.json(user);
	});
