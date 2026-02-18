import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Pencil, Scissors, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

const orders = [
	{
		order_code: "ORD-001",
		customer_name: "Budi Santoso",
		product_type: "Kaos",
		quantity: 100,
		status: "Produksi Berjalan",
		estimated_finish: "2026-03-01",
	},
	{
		order_code: "ORD-002",
		customer_name: "Siti Rahayu",
		product_type: "Jaket",
		quantity: 50,
		status: "Pending",
		estimated_finish: "2026-02-28",
	},
	{
		order_code: "ORD-003",
		customer_name: "Ahmad Fauzi",
		product_type: "Kemeja",
		quantity: 75,
		status: "Quality Check",
		estimated_finish: "2026-02-25",
	},
];

function getStatusBadge(status: string) {
	const styles: Record<string, string> = {
		"Order Diterima": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
		"Approval Sample": "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
		"Menunggu Antrian": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
		"Produksi Berjalan": "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
		Pending: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
		"Quality Check": "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
		"Siap Diambil": "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
		"Order Selesai": "bg-green-50 text-green-700 ring-1 ring-green-200",
	};

	const dotColors: Record<string, string> = {
		"Order Diterima": "bg-blue-500",
		"Approval Sample": "bg-violet-500",
		"Menunggu Antrian": "bg-amber-500",
		"Produksi Berjalan": "bg-indigo-500",
		Pending: "bg-orange-500",
		"Quality Check": "bg-purple-500",
		"Siap Diambil": "bg-teal-500",
		"Order Selesai": "bg-green-500",
	};

	const style =
		styles[status] ?? "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
	const dot = dotColors[status] ?? "bg-slate-400";

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style}`}
		>
			<span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
			{status}
		</span>
	);
}

function RouteComponent() {
	const [activeTab, setActiveTab] = useState("semua");
	return (
		<div className="flex flex-col h-screen">
			<header className="w-full bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
				<div className="gap-2 flex items-center">
					<div className="bg-indigo-600 rounded-xl p-2 flex items-center justify-center">
						<Scissors className="text-white" size={20} />
					</div>
					<span className="text-lg font-medium text-slate-900">Jahitin</span>
				</div>
				<div className="gap-3 flex items-center">
					<span className="text-sm font-normal text-slate-900">
						Selamat Datang, Andi!
					</span>
					<div className="w-px h-5 bg-slate-200" />
					<button
						type="button"
						className="text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
					>
						<LogOut size={20} />
					</button>
				</div>
			</header>
			<main className="flex-1 bg-slate-50 overflow-auto px-6 py-8">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold text-slate-900">Daftar Order</h1>
						<button
							type="button"
							className="bg-indigo-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
						>
							Buat Order
						</button>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3 mb-6">
						<div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1 w-full sm:w-auto">
							{[
								{ value: "semua", label: "Semua" },
								{ value: "aktif", label: "Aktif" },
								{ value: "selesai", label: "Selesai" },
							].map((tab) => (
								<button
									type="button"
									key={tab.value}
									onClick={() => setActiveTab(tab.value)}
									className={`px-4 py-2 w-full sm:w-auto rounded-lg text-sm font-medium transition-all cursor-pointer ${
										activeTab === tab.value
											? "bg-white text-slate-900"
											: "text-slate-500 hover:text-slate-700"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
						<div className="flex flex-wrap gap-3 ml-auto">
							<div className="relative w-full sm:w-auto">
								<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
									<Search size={16} />
								</span>
								<input
									className="pl-9 pr-4 py-2.5 w-full sm:w-auto bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="Cari..."
								/>
							</div>
							<select className="px-4 py-2.5 w-full sm:w-auto bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
								<option value="">Semua Status</option>
								<option value="Order Diterima">Order Diterima</option>
								<option value="Approval Sample">Approval Sample</option>
								<option value="Menunggu Antrian">Menunggu Antrian</option>
								<option value="Produksi Berjalan">Produksi Berjalan</option>
								<option value="Pending">Pending</option>
								<option value="Quality Check">Quality Check</option>
								<option value="Siap Diambil">Siap Diambil</option>
								<option value="Order Selesai">Order Selesai</option>
							</select>
						</div>
					</div>
					<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full min-w-175">
								<thead>
									<tr className="bg-slate-100">
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Kode Order
										</th>
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Nama Pemesan
										</th>
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Jenis Produk
										</th>
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Qty
										</th>
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Status
										</th>
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Estimasi Selesai
										</th>
										<th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-widest px-6 py-4 border-b border-slate-100">
											Aksi
										</th>
									</tr>
								</thead>
								<tbody>
									{orders.map((order) => (
										<tr
											key={order.order_code}
											className="hover:bg-slate-50 transition-colors"
										>
											<td className="px-6 py-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors cursor-pointer whitespace-nowrap">
												{order.order_code}
											</td>
											<td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
												{order.customer_name}
											</td>
											<td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
												{order.product_type}
											</td>
											<td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
												{order.quantity}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{getStatusBadge(order.status)}
											</td>
											<td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
												{order.estimated_finish}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-2">
													<button
														type="button"
														className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
													>
														<Pencil size={16} />
													</button>
													<button
														type="button"
														className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
													>
														<Trash2 size={16} />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
