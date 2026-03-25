import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/admin-layout";

export const Route = createFileRoute("/_admin")({
	beforeLoad: () => {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) {
			throw redirect({ to: "/login" });
		}
	},
	component: AdminLayout,
});
