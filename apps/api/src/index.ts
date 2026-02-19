import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./modules/auth/routes";
import { userRouter } from "./modules/user/routes";
import { orderRouter } from "./modules/orders/orderRoute";

console.log("ENV:", process.env.TEST);
const app = new Hono()
  .use(cors())
  .route("/api", authRouter)
  .route("/api/user", userRouter)
  .route("/api", orderRouter);

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
