import type { User } from "@/types";
import { apiClient } from "@/utils/api";

export async function fetchUsers(): Promise<User[]> {
	const token = localStorage.getItem("token");

	const res = await apiClient.api.user.$get(
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
		throw new Error("Failed to fetch users");
	}

	const json = (await res.json()) as {
		data: User[];
	};

	return json.data;
}
