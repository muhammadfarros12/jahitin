import { hc } from "hono/client";
import type { AppType } from "../../../api/src/index";

const apiUrl = import.meta.env.VITE_API_URL;

export const apiClient = hc<AppType>(apiUrl);
