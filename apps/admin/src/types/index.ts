export type OrderStatus =
	| "ORDER_DITERIMA"
	| "APPROVAL_SAMPLE"
	| "MENUNGGU_ANTRIAN"
	| "PRODUKSI_BERJALAN"
	| "PENDING"
	| "QUALITY_CHECK"
	| "SIAP_DIAMBIL"
	| "ORDER_SELESAI";

export interface User {
	id: number;
	name: string | null;
	email: string;
}

export interface ProductionIssue {
	id: number;
	order_id: number;
	previous_status: OrderStatus;
	issue_description: string;
	solution: string | null;
	adjust_finished_date: string | null;
	is_resolved: boolean;
	resolved_at: string | null;
	resolved_by: number | null;
	created_at: string;
	updated_at: string;
}

export interface OrderStatusUpdate {
	id: number;
	order_id: number;
	status: OrderStatus;
	notes: string | null;
	created_at: string;
	created_by: number | null;
	user?: User | null;
}

export interface Order {
	id: number;
	order_code: string;
	customer_name: string;
	order_description: string;
	estimated_finished_date: string;
	current_status: OrderStatus;
	created_at: string;
	updated_at: string;
	created_by: number | null;
	createdBy?: User | null;
	status_updates: OrderStatusUpdate[];
	production_issue: (ProductionIssue & { resolver?: User | null }) | null;
	// Aliases for UI compatibility with user's "original" code
	active_production_issue?: ProductionIssue | null;
	is_pending?: boolean;
}
