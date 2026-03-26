import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { authRouter } from "./modules/auth/routes";
import { orderIssueRouter } from "./modules/orderIssue/orderIssueRoute";
import { orderRouter } from "./modules/orders/orderRoute";
import { publicOrderRouter } from "./modules/orders/publicOrderRoute";
import { statusUpdateRouter } from "./modules/orders/statusUpdateRoute";
import { userRouter } from "./modules/user/routes";

// console.log("ENV:", process.env.TEST);
const app = new Hono()
	.use(logger())
	.use(
		cors({
			origin: "*",
			allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.route("/api", authRouter)
	.route("/api/user", userRouter)

	.route("/api", publicOrderRouter)
	.route("/api", orderRouter)
	.route("/api", statusUpdateRouter)
	.route("/api", orderIssueRouter)
	.onError((err, c) => {
		if (err instanceof HTTPException) {
			return c.json({ message: err.message }, err.status);
		}
		return c.json({ message: "Internal server error" }, 500);
	});

//export api specification
export type AppType = typeof app;

serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
