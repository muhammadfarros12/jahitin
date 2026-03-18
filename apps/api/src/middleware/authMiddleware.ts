import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import { isNumberObject } from "node:util/types";

export const authMiddleware = createMiddleware(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new HTTPException(401, {
			message: "Unauthorized",
		});
	}

	const token = authHeader.split(" ")[1];

	try {
		const JWT_SECRET = process.env.JWT_SECRET;

		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET is not defined");
		}
		const payload = jwt.verify(token, JWT_SECRET);
		// c.set("user", payload.sub);
		// Guard: pastikan payload adalah object, bukan string
		if (typeof payload === "string" || !payload.sub) {
			throw new HTTPException(401, { message: "Invalid token payload" });
		}

		const userId = Number(payload.sub);
		if (isNumberObject(userId)) {
			throw new HTTPException(401, { message: "Invalid user id in token" });
		}

		c.set("user", userId);
		await next();
	} catch (_error) {
		throw new HTTPException(401, {
			message: "Invalid token",
		});
	}
});
