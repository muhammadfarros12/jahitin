import { hc } from "hono/client";
import type { AppType } from "../../../api/src/index";

export const apiClient = hc<AppType>("http://localhost:8000");
