import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../utils/prisma";
import { adminSchema } from "./schema";

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
				password: hashPassword,
			},
		});

		return c.json({
			message: "Admin created successfully",
			data: {
				id: newAdmin.id,
				name: newAdmin.name,
				email: newAdmin.email,
			},
		});
	})

	.get("/", async (c) => {
		const admins = await prisma.user.findMany({
			select: { id: true, name: true, email: true, createdAt: true },
		});
		return c.json({ status: "success", data: admins });
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
			select: { id: true, name: true, email: true },
		});

		return c.json(user);
	});
