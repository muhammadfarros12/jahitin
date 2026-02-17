import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRouter } from "./modules/auth/routes";
import { userRouter } from "./modules/user/routes";

const app = new Hono();

console.log("ENV:", process.env.TEST);

app.route("/api", authRouter);
app.route("/api/user", userRouter);

serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
