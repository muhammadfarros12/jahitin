import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prisma } from "./utils/prisma"
import { cors } from "hono/cors";
import { authRouter } from "./modules/auth/authRoute";


const app = new Hono()
	.use(cors())
	.route("/auth", authRouter)
	.get("/",async (c) => {
	await prisma.user.findMany()
	return c.json({message:"Test gak error",data: []})
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
