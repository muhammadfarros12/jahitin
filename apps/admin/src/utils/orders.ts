import type { Order } from "@/types";
import { apiClient } from "@/utils/api";

export async function fetchOrders({
	page = 1,
	limit = 10,
	search = "",
	status = "ALL",
	sortBy = "newest",
}: {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	sortBy?: string;
} = {}): Promise<{
	data: Order[];
	total: number;
	page: number;
	limit: number;
}> {
	const token = localStorage.getItem("token");

	const res = await apiClient.api.orders.$get(
		{
			query: {
				page: String(page),
				limit: String(limit),
				search,
				status,
				sortBy,
			},
		},
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

	const json = (await res.json()) as {
		success: boolean;
		data: Order[];
		total: number;
		page: number;
		limit: number;
	};
	return {
		data: json.data,
		total: json.total,
		page: json.page,
		limit: json.limit,
	};
}

export async function fetchOrderStats(): Promise<{
	total: number;
	production: number;
	pending: number;
	completed: number;
}> {
	const token = localStorage.getItem("token");

	const res = await apiClient.api.orders.stats.$get(
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!res.ok) {
		throw new Error("Failed to fetch order stats");
	}

	const json = (await res.json()) as {
		data: {
			total: number;
			production: number;
			pending: number;
			completed: number;
		};
	};
	return json.data;
}
