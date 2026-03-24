import { apiClient } from "@/utils/api";
import type { Order } from "@/types";

export async function fetchOrders(): Promise<Order[]> {
	const token = localStorage.getItem("token");

	const res = await apiClient.api.orders.$get(
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!res.ok) {
		if ((res.status as number) === 401) {
			window.location.href = "/login";
		}
		throw new Error("Failed to fetch orders");
	}

	const json = await res.json();
	// @ts-ignore - response has data property
	return json.data as Order[];
}
