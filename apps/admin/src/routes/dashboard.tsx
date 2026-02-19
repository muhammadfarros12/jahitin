import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Pencil, Scissors, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

const orders = [
  {
    order_code: "JAH260219001",
    customer_name: "Budi Santoso",
    order_description: "Kaos polos 100 pcs ukuran M",
    current_status: "PRODUKSI_BERJALAN",
    estimated_finished_date: "2026-03-01",
  },
  {
    order_code: "JAH260219002",
    customer_name: "Siti Rahayu",
    order_description: "Jaket varsity 50 pcs ukuran L",
    current_status: "PENDING",
    estimated_finished_date: "2026-02-28",
  },
  {
    order_code: "JAH260219003",
    customer_name: "Ahmad Fauzi",
    order_description: "Kemeja formal 75 pcs ukuran M",
    current_status: "QUALITY_CHECK",
    estimated_finished_date: "2026-02-25",
  },
  {
    order_code: "JAH260219004",
    customer_name: "Linka Hijab",
    order_description: "Pasmina instan 30 pcs",
    current_status: "ORDER_SELESAI",
    estimated_finished_date: "2026-02-10",
  },
  {
    order_code: "JAH260219005",
    customer_name: "Rudi Hartono",
    order_description: "Kaos sablon 60 pcs ukuran XL",
    current_status: "ORDER_SELESAI",
    estimated_finished_date: "2026-02-15",
  },
];

const STATUS_LABEL: Record<string, string> = {
  ORDER_DITERIMA: "Order Diterima",
  APPROVAL_SAMPLE: "Approval Sample",
  MENUNGGU_ANTRIAN: "Menunggu Antrian",
  PRODUKSI_BERJALAN: "Produksi Berjalan",
  PENDING: "Pending",
  QUALITY_CHECK: "Quality Check",
  SIAP_DIAMBIL: "Siap Diambil",
  ORDER_SELESAI: "Order Selesai",
};

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    ORDER_DITERIMA: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    APPROVAL_SAMPLE: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    MENUNGGU_ANTRIAN: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    PRODUKSI_BERJALAN: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    PENDING: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    QUALITY_CHECK: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
    SIAP_DIAMBIL: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    ORDER_SELESAI: "bg-green-50 text-green-700 ring-1 ring-green-200",
  };

  const dotColors: Record<string, string> = {
    ORDER_DITERIMA: "bg-blue-500",
    APPROVAL_SAMPLE: "bg-violet-500",
    MENUNGGU_ANTRIAN: "bg-amber-500",
    PRODUKSI_BERJALAN: "bg-indigo-500",
    PENDING: "bg-orange-500",
    QUALITY_CHECK: "bg-purple-500",
    SIAP_DIAMBIL: "bg-teal-500",
    ORDER_SELESAI: "bg-green-500",
  };

  const style =
    styles[status] ?? "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  const dot = dotColors[status] ?? "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function RouteComponent() {
  const [activeTab, setActiveTab] = useState("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredOrders = orders.filter((order) => {
    const tabMatch =
      activeTab === "semua" ||
      (activeTab === "aktif" && order.current_status !== "ORDER_SELESAI") ||
      (activeTab === "selesai" && order.current_status === "ORDER_SELESAI");

    const searchMatch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_code.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch =
      statusFilter === "" || order.current_status === statusFilter;

    return tabMatch && searchMatch && statusMatch;
  });

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full sm:w-auto bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Cari pemesan..."
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 w-full sm:w-auto bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Status</option>
                <option value="ORDER_DITERIMA">Order Diterima</option>
                <option value="APPROVAL_SAMPLE">Approval Sample</option>
                <option value="MENUNGGU_ANTRIAN">Menunggu Antrian</option>
                <option value="PRODUKSI_BERJALAN">Produksi Berjalan</option>
                <option value="PENDING">Pending</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="SIAP_DIAMBIL">Siap Diambil</option>
                <option value="ORDER_SELESAI">Order Selesai</option>
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
                      Deskripsi Order
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Search size={40} className="text-slate-400" />
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-md font-medium text-slate-900">
                              Order Tidak Ditemukan
                            </p>
                            <p className="text-sm text-slate-500">
                              Coba ubah filter atau kata kunci pencarian.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.order_code}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors cursor-pointer whitespace-nowrap">
                          {order.order_code}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                          {order.order_description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.current_status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
                          {order.estimated_finished_date}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
