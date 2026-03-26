import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import type { Role } from "../generated/prisma/enums";
import { prisma } from "../utils/prisma";

export const authMiddleware = createMiddleware<{
	Variables: {
		user: number;
		role: Role;
	};
}>(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const JWT_SECRET = process.env.JWT_SECRET;
		if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

		const payload = jwt.verify(token, JWT_SECRET);

		if (typeof payload === "string" || !payload.sub) {
			throw new HTTPException(401, { message: "Invalid token payload" });
		}

		const userId = Number(payload.sub);
		if (Number.isNaN(userId)) {
			throw new HTTPException(401, { message: "Invalid user id in token" });
		}

		// Ambil role dari database
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!user) {
			throw new HTTPException(401, { message: "User not found" });
		}

		c.set("user", userId);
		c.set("role", user.role);
		await next();
	} catch (error) {
		if (error instanceof HTTPException) throw error;
		throw new HTTPException(401, { message: "Invalid token" });
	}
});
