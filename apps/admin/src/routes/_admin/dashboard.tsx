import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Edit, Trash2, AlertCircle,
  CheckCircle2,
  Clock,
  Shirt,
  RefreshCcw,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Order, OrderStatus } from "@/types";
import { toast } from "sonner";
import { fetchOrders } from "@/utils/orders";
import { apiClient } from "@/utils/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_admin/dashboard")({
  component: DashboardPage,
});

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  ORDER_DITERIMA:    { label: "Order Diterima",    color: "badge-status-order-diterima" },
  APPROVAL_SAMPLE:   { label: "Approval Sample",   color: "badge-status-approval-sample" },
  MENUNGGU_ANTRIAN:  { label: "Menunggu Antrian",  color: "badge-status-menunggu-antrian" },
  PRODUKSI_BERJALAN: { label: "Produksi Berjalan", color: "badge-status-produksi-berjalan" },
  PENDING:           { label: "Pending",           color: "badge-status-pending" },
  QUALITY_CHECK:     { label: "Quality Check",     color: "badge-status-quality-check" },
  SIAP_DIAMBIL:      { label: "Siap Diambil",      color: "badge-status-siap-diambil" },
  ORDER_SELESAI:     { label: "Selesai",           color: "badge-status-order-selesai" },
};

const STATUS_DOT_CLASSES: Record<OrderStatus, string> = {
  ORDER_DITERIMA:    "timeline-dot-status-order-diterima",
  APPROVAL_SAMPLE:   "timeline-dot-status-approval-sample",
  MENUNGGU_ANTRIAN:  "timeline-dot-status-menunggu-antrian",
  PRODUKSI_BERJALAN: "timeline-dot-status-produksi-berjalan",
  PENDING:           "timeline-dot-status-pending",
  QUALITY_CHECK:     "timeline-dot-status-quality-check",
  SIAP_DIAMBIL:      "timeline-dot-status-siap-diambil",
  ORDER_SELESAI:     "timeline-dot-status-order-selesai",
};

function DashboardPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [issueSolution, setIssueSolution] = useState("");
  const [issueAdjDate, setIssueAdjDate] = useState("");

  // Form state for create/edit
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");

  const { data: apiOrders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // Use API data only, remove dummy fallback
  const orders: Order[] = (apiOrders && apiOrders.length > 0) ? apiOrders as Order[] : [];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.order_code.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || o.current_status === statusFilter;

      if (activeTab === "selesai") return matchesSearch && matchesStatus && o.current_status === "ORDER_SELESAI";
      if (activeTab === "aktif") return matchesSearch && matchesStatus && o.current_status !== "ORDER_SELESAI";
      if (activeTab === "pending") return matchesSearch && matchesStatus && o.current_status === "PENDING";
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, activeTab, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    produksi: orders.filter(o => o.current_status !== "ORDER_SELESAI").length,
    pending: orders.filter(o => o.current_status === "PENDING").length,
    selesai: orders.filter(o => o.current_status === "ORDER_SELESAI").length,
  }), [orders]);

  const { mutate: createOrder, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const res = await apiClient.api.orders.$post(
        { json: { customer_name: formName, order_description: formDesc, estimated_finished_date: formDate } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Gagal membuat order");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Order berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsCreateSheetOpen(false);
      setFormName(""); setFormDesc(""); setFormDate("");
    },
    onError: () => toast.error("Gagal membuat order"),
  });

  const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await (apiClient.api.orders as any)[":id"].$delete(
        { param: { id: String(id) } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Gagal menghapus order");
    },
    onSuccess: () => {
      toast.success("Order berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus order"),
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      if (!selectedOrderDetails) return;
      const status = newStatus ?? selectedOrderDetails.current_status;
      const body: any = { status, notes: statusNotes || undefined };
      if (status === "PENDING") {
        body.issue_description = issueDesc;
        body.solution = issueSolution;
        if (issueAdjDate) body.adjust_finished_date = issueAdjDate;
      }
      const res = await (apiClient.api.orders as any)[":id"]["status-updates"].$post(
        { param: { id: String(selectedOrderDetails.id) }, json: body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Gagal update status");
    },
    onSuccess: () => {
      toast.success("Status berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrderDetails(null);
      setNewStatus(null);
      setStatusNotes(""); setIssueDesc(""); setIssueSolution(""); setIssueAdjDate("");
    },
    onError: () => toast.error("Gagal memperbarui status"),
  });

  const openEdit = (order: Order) => {
    setEditOrder(order);
    setFormName(order.customer_name);
    setFormDesc(order.order_description);
    setFormDate(new Date(order.estimated_finished_date).toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-8">
      {/* Statistical Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Order */}
        <Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
          <CardContent className="p-5 h-full flex flex-col">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total Order</p>
            <div className="flex-1 flex items-center justify-between">
              <div className="relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-foreground/20" />
                <div className="text-4xl font-bold tracking-tight tabular-nums text-foreground">{stats.total}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted border border-border/50">
                <Shirt className="h-5 w-5 text-foreground/70" />
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">Total Order Masuk</p>
          </CardContent>
        </Card>

        {/* Dalam Produksi */}
        <Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
          <CardContent className="p-5 h-full flex flex-col">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Dalam Produksi</p>
            <div className="flex-1 flex items-center justify-between">
              <div className="relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-stat-warning" />
                <div className="text-4xl font-bold tracking-tight tabular-nums text-stat-warning">{stats.produksi}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stat-warning/10 border border-stat-warning/20">
                <Clock className="h-5 w-5 text-stat-warning" />
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">Sedang dikerjakan tim</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
          <CardContent className="p-5 h-full flex flex-col">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Pending</p>
            <div className="flex-1 flex items-center justify-between">
              <div className="relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-stat-danger" />
                <div className="text-4xl font-bold tracking-tight tabular-nums text-stat-danger">{stats.pending}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stat-danger/10 border border-stat-danger/20">
                <AlertCircle className="h-5 w-5 text-stat-danger" />
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">Keterlambatan Produksi</p>
          </CardContent>
        </Card>

        {/* Selesai */}
        <Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
          <CardContent className="p-5 h-full flex flex-col">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Selesai</p>
            <div className="flex-1 flex items-center justify-between">
              <div className="relative">
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-stat-success" />
                <div className="text-4xl font-bold tracking-tight tabular-nums text-stat-success">{stats.selesai}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stat-success/10 border border-stat-success/20">
                <CheckCircle2 className="h-5 w-5 text-stat-success" />
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">Sudah Terkirim</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Management System */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col lg:flex-row flex-1 lg:items-center gap-4 w-full">
            <div className="w-full lg:w-fit">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-fit">
                <TabsList className="w-full lg:w-fit flex">
                  <TabsTrigger value="semua" className="flex-1 lg:flex-none">Semua</TabsTrigger>
                  <TabsTrigger value="aktif" className="flex-1 lg:flex-none">Aktif</TabsTrigger>
                  <TabsTrigger value="pending" className="flex-1 lg:flex-none">Pending</TabsTrigger>
                  <TabsTrigger value="selesai" className="flex-1 lg:flex-none">Selesai</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1 lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] h-10 border-border bg-card">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full md:max-w-xs lg:flex-1 lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau kode order..."
                  className="pl-10 h-10 border-border bg-card w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          {orders.length > 0 && (
            <Button onClick={() => { setEditOrder(null); setFormName(""); setFormDesc(""); setFormDate(""); setIsCreateSheetOpen(true); }} className="w-full lg:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 font-semibold shadow-sm">
              <Plus className="h-4 w-4" />
              Buat Order
            </Button>
          )}
        </div>

        <div className="rounded-md border border-border bg-background overflow-hidden">
          <Table>
            <TableHeader className="bg-card">
              <TableRow>
                <TableHead className="w-[180px] px-6">Kode Order</TableHead>
                <TableHead className="px-6">Customer</TableHead>
                <TableHead className="max-w-[200px] px-6">Deskripsi</TableHead>
                <TableHead className="px-6">Status</TableHead>
                <TableHead className="px-6">Estimasi Selesai</TableHead>
                <TableHead className="text-right px-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => { setSelectedOrderDetails(order); setNewStatus(null); setStatusNotes(""); setIssueDesc(order.production_issue?.issue_description ?? ""); setIssueSolution(order.production_issue?.solution ?? ""); setIssueAdjDate(""); }}
                  >
                    <TableCell className="font-mono font-medium text-primary hover:underline px-6">
                      {order.order_code}
                    </TableCell>
                    <TableCell className="font-medium text-foreground px-6">{order.customer_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground px-6">
                      {order.order_description}
                    </TableCell>
                    <TableCell className="px-6">
                      <Badge className={`${STATUS_LABELS[order.current_status].color} border-none font-medium px-2 py-0.5`}>
                        {STATUS_LABELS[order.current_status].label}
                      </Badge>
                      {(order.is_pending || order.current_status === "PENDING") && (
                        <AlertCircle className="inline h-3.5 w-3.5 ml-1.5 text-destructive mb-0.5" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6">
                      {new Date(order.estimated_finished_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(order)} className="gap-2 focus:bg-accent cursor-pointer">
                            <Edit className="h-4 w-4 text-muted-foreground" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setSelectedOrderDetails(order); setNewStatus(null); setStatusNotes(""); setIssueDesc(order.production_issue?.issue_description ?? ""); setIssueSolution(order.production_issue?.solution ?? ""); setIssueAdjDate(""); }} 
                            className="gap-2 focus:bg-accent cursor-pointer"
                          >
                            <RefreshCcw className="h-4 w-4 text-muted-foreground" /> Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(order.id)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-[450px] text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-[320px] mx-auto">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        {orders.length === 0 ? (
                          <Shirt className="h-10 w-10 text-muted-foreground/40" />
                        ) : (
                          <Search className="h-10 w-10 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-lg text-foreground">
                          {orders.length === 0 ? "Daftar Order Masih Kosong" : "Order Tidak Ditemukan"}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed px-4">
                          {orders.length === 0 
                            ? "Belum ada order yang tercatat saat ini."
                            : "Coba ubah filter atau kata kunci Anda."}
                        </p>
                      </div>
                      {orders.length === 0 && (
                        <Button 
                          onClick={() => { setEditOrder(null); setFormName(""); setFormDesc(""); setFormDate(""); setIsCreateSheetOpen(true); }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-8 rounded-xl shadow-md transition-all active:scale-95"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Buat Order Sekarang
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Sheet */}
      <Sheet
        open={isCreateSheetOpen || !!editOrder}
        onOpenChange={(open) => { if (!open) { setIsCreateSheetOpen(false); setEditOrder(null); } }}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-8 sm:p-10">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl">{editOrder ? "Edit Order" : "Buat Order Baru"}</SheetTitle>
            <SheetDescription className="text-sm">
              {editOrder ? "Perbarui detail pesanan pelanggan." : "Lengkapi formulir di bawah untuk membuat pesanan baru."}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 pt-8">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nama Customer</Label>
              <Input id="name" placeholder="Budi Santoso" className="bg-card border-border h-11 focus-visible:ring-primary/20" value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Deskripsi Order</Label>
              <Textarea
                id="desc"
                className="bg-card border-border min-h-[120px] focus-visible:ring-primary/20"
                placeholder="Jenis, bahan, warna, ukuran, jumlah..."
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eta" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Estimasi Selesai</Label>
              <Input id="eta" type="date" className="bg-card border-border h-11 focus-visible:ring-primary/20" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>
            <Button
              className="mt-4 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              disabled={isCreating}
              onClick={() => {
                if (editOrder) {
                  toast.success("Order diperbarui (simulasi — API edit belum tersedia)");
                  setEditOrder(null);
                } else {
                  createOrder();
                }
              }}
            >
              {isCreating ? "Menyimpan..." : editOrder ? "Simpan Perubahan" : "Buat Order"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data order ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" className="flex-1" disabled={isDeleting} onClick={() => deleteId && deleteOrder(deleteId)}>
              {isDeleting ? "Menghapus..." : "Hapus Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail & Status Update Sheet */}
      <Sheet open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-8 sm:p-10">
          <SheetHeader className="text-left border-b border-border pb-6">
            <SheetTitle className="text-xl sm:text-2xl flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              Detail Order: <span className="text-primary">{selectedOrderDetails?.order_code}</span>
            </SheetTitle>
          </SheetHeader>
          {selectedOrderDetails && (
            <div className="grid gap-6 pt-6">
              <div className="space-y-4 rounded-lg bg-muted/50 p-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Customer</Label>
                    <p className="font-semibold text-foreground">{selectedOrderDetails.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Status Saat Ini</Label>
                    <div>
                      <Badge className={`${STATUS_LABELS[selectedOrderDetails.current_status].color} border-none`}>
                        {STATUS_LABELS[selectedOrderDetails.current_status].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Estimasi Selesai</Label>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedOrderDetails.estimated_finished_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Deskripsi</Label>
                    <p className="text-sm text-foreground">{selectedOrderDetails.order_description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Informasi Produksi</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground uppercase font-medium tracking-widest">Ubah Status</Label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-border bg-card text-foreground px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      value={newStatus ?? selectedOrderDetails.current_status}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {(newStatus === "PENDING" || (selectedOrderDetails.current_status === "PENDING" && !newStatus)) && (
                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="grid gap-2">
                        <Label className="text-xs text-orange-900/70 dark:text-orange-200/70">Deskripsi Kendala</Label>
                        <Textarea
                          placeholder="Sebutkan kendala yang terjadi..."
                          className="bg-white dark:bg-card border border-orange-200 dark:border-border shadow-none rounded-xl min-h-[80px] focus-visible:ring-orange-500/20 focus-visible:border-orange-500"
                          value={issueDesc}
                          onChange={e => setIssueDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-orange-900/70 dark:text-orange-200/70">Rencana Solusi</Label>
                        <Textarea
                          placeholder="Tindakan yang akan atau sedang diambil..."
                          className="bg-white dark:bg-card border border-orange-200 dark:border-border shadow-none rounded-xl min-h-[80px] focus-visible:ring-orange-500/20 focus-visible:border-orange-500"
                          value={issueSolution}
                          onChange={e => setIssueSolution(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-orange-900/70 dark:text-orange-200/70">Revisi Estimasi Selesai</Label>
                        <Input
                          type="date"
                          className="bg-white dark:bg-card border border-orange-200 dark:border-border shadow-none rounded-xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500"
                          value={issueAdjDate}
                          onChange={e => setIssueAdjDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground uppercase font-medium tracking-widest">Catatan Status (Opsional)</Label>
                    <Textarea
                      placeholder="Misal: Mulai potong bahan, Sudah dikirim, dll"
                      className="border-border bg-card rounded-xl shadow-none min-h-[100px]"
                      value={statusNotes}
                      onChange={e => setStatusNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl border-border font-bold" onClick={() => setSelectedOrderDetails(null)}>Batal</Button>
                    <Button
                      className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
                      disabled={isUpdating}
                      onClick={() => updateStatus()}
                    >
                      {isUpdating ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4 mt-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Riwayat Status</h3>
                <div className="space-y-6 relative before:absolute before:left-5 before:top-0 before:bottom-0 before:-translate-x-px before:w-[1px] before:bg-border">
                  {(selectedOrderDetails.status_updates ?? []).length > 0 ? (
                    selectedOrderDetails.status_updates?.map((item, idx) => (
                      <div key={item.id} className="relative flex items-start gap-4 pl-10">
                        <div className={`absolute left-5 -translate-x-1/2 mt-1.5 h-3 w-3 rounded-full border-2 border-background shadow-sm ${STATUS_DOT_CLASSES[item.status]} ${idx === 0 ? "scale-125" : ""}`} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-muted-foreground">{new Date(item.created_at).toLocaleString("id-ID")}</span>
                          <span className="font-semibold text-sm text-foreground">{STATUS_LABELS[item.status].label}</span>
                          {item.notes && <p className="text-sm text-muted-foreground italic">"{item.notes}"</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground ml-10">Belum ada riwayat status.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
