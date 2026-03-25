import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (token) {
			throw redirect({ to: "/dashboard" });
		} else {
			throw redirect({ to: "/login" });
		}
	},
});
