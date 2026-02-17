import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../utils/prisma";
import { adminSchema } from "./schema";

export const authRouter = new Hono()
	.post("/login", zValidator("json", adminSchema), async (c) => {
		const body = c.req.valid("json");
		try {
			//1-a. cek ada tidak email
			const existingUser = await prisma.user.findUnique({
				where: { email: body.email },
			});
			//1-b.jika salah kirim pesan eror
			if (!existingUser) throw new Error("Invalid credential");

			//2-a. cek apakah user dan passwordnya sesuai
			const validPassword = await bcrypt.compare(
				body.password,
				existingUser.password,
			);

			//2-b. jika salah kirim pesan error
			if (!validPassword) throw new Error("Invalid credential");

			const JWT_SECRET = process.env.JWT_SECRET;

			if (!JWT_SECRET) {
				throw new Error("JWT_SECRET is not defined");
			}

			//3. jika benar berikan token
			const accessToken = jwt.sign({ sub: existingUser.id }, JWT_SECRET, {
				expiresIn: "1h",
			});
			return c.json(
				{
					data: {
						id: existingUser.id,
						username: existingUser.name,
						email: existingUser.email,
					},
					token: accessToken,
				},
				200,
			);
		} catch (error) {
			throw new HTTPException(401, {
				message: error instanceof Error ? error.message : "Invalid Credential",
			});
		}
	})
	.post("/logout", authMiddleware, async (c) => {
		return c.json({ message: "Logout success" });
	});
