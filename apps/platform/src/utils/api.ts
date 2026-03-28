const API_BASE = "http://localhost:8000";

export interface OrderStatusUpdate {
	id: number;
	order_id: number;
	status: string;
	notes: string | null;
	created_at: string;
}

export interface ProductionIssue {
	id: number;
	order_id: number;
	previous_status: string;
	issue_description: string;
	solution: string | null;
	adjust_finished_date: string | null;
	is_resolved: boolean;
	resolved_at: string | null;
	resolved_by: number | null;
	created_at: string;
	updated_at: string;
}

export interface Order {
	id: number;
	order_code: string;
	customer_name: string;
	order_description: string;
	estimated_finished_date: string;
	current_status: string;
	created_at: string;
	updated_at: string;
	status_updates: OrderStatusUpdate[];
	production_issue?: ProductionIssue | null;
}

export async function getOrderByCode(orderCode: string): Promise<Order | null> {
	const res = await fetch(`${API_BASE}/api/track/${orderCode}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("Gagal mengambil data order");
	const json = await res.json();
	return json.data as Order;
}
