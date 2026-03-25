import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/admin-layout";

export const Route = createFileRoute("/_admin")({
	component: AdminPage,
});

function AdminPage() {
	return (
		<AdminLayout>
			<Outlet />
		</AdminLayout>
	);
}
