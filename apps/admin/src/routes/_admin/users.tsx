import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Edit,
	MoreHorizontal,
	Plus,
	RefreshCcw,
	Search,
	Shield,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import type { User } from "@/types";
import { apiClient } from "@/utils/api";
import { fetchUsers } from "@/utils/users";

export const Route = createFileRoute("/_admin/users")({
	component: UsersPage,
});

type UserFormData = {
	name: string;
	email: string;
	password: string;
};

function UsersPage() {
	const { token, user: currentUser } = useAuth();
	const queryClient = useQueryClient();
	const isSuperAdmin = currentUser?.role === "SUPERADMIN";

	const [search, setSearch] = useState("");
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editUser, setEditUser] = useState<User | null>(null);
	const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

	const [formName, setFormName] = useState("");
	const [formEmail, setFormEmail] = useState("");
	const [formPassword, setFormPassword] = useState("");

	const resetForm = () => {
		setFormName("");
		setFormEmail("");
		setFormPassword("");
	};

	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: fetchUsers,
	});

	const filteredUsers = users.filter(
		(u) =>
			u.name?.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase()),
	);

	const { mutate: createUser, isPending: isCreating } = useMutation({
		mutationFn: async (form: UserFormData) => {
			const res = await apiClient.api.user.create.$post(
				{
					json: {
						name: form.name,
						email: form.email,
						password: form.password,
					},
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) {
				const data = (await res.json()) as unknown as { message: string };
				throw new Error(data.message || "Gagal membuat user");
			}
			return res.json();
		},
		onSuccess: () => {
			toast.success("User berhasil dibuat");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setIsCreateSheetOpen(false);
			resetForm();
		},
		onError: (error: Error) =>
			toast.error(error.message || "Gagal membuat user"),
	});

	const { mutate: updateUser, isPending: isUpdating } = useMutation({
		mutationFn: async (form: UserFormData) => {
			if (!editUser) return;
			const body: { name?: string; email?: string; password?: string } = {};
			if (form.name) body.name = form.name;
			if (form.email) body.email = form.email;
			if (form.password) body.password = form.password;

			const res = await apiClient.api.user[":id"].$put(
				{
					param: { id: String(editUser.id) },
					json: body,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) {
				const data = (await res.json()) as unknown as { message: string };
				throw new Error(data.message || "Gagal memperbarui user");
			}
			return res.json();
		},
		onSuccess: () => {
			toast.success("User berhasil diperbarui");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setEditUser(null);
			resetForm();
		},
		onError: (error: Error) =>
			toast.error(error.message || "Gagal memperbarui user"),
	});

	const { mutate: deleteUser, isPending: isDeleting } = useMutation({
		mutationFn: async (id: number) => {
			const res = await apiClient.api.user[":id"].$delete(
				{ param: { id: String(id) } },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) {
				const data = (await res.json()) as unknown as { message: string };
				throw new Error(data.message || "Gagal menghapus user");
			}
		},
		onSuccess: () => {
			toast.success("User berhasil dihapus");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setDeleteId(null);
		},
		onError: (error: Error) =>
			toast.error(error.message || "Gagal menghapus user"),
	});

	const openEdit = (u: User) => {
		setEditUser(u);
		setFormName(u.name ?? "");
		setFormEmail(u.email);
		setFormPassword("");
		setIsCreateSheetOpen(false);
	};

	const handleSubmit = () => {
		const form: UserFormData = {
			name: formName,
			email: formEmail,
			password: formPassword,
		};
		if (editUser) {
			updateUser(form);
		} else {
			createUser(form);
		}
	};

	return (
		<div className="space-y-8">
			{/* User Management */}
			<div className="space-y-4">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
					<div className="relative w-full lg:w-[320px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Cari nama atau email..."
							className="pl-10 h-10 border-border bg-card w-full"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					{isSuperAdmin && (
						<Button
							onClick={() => {
								setEditUser(null);
								resetForm();
								setIsCreateSheetOpen(true);
							}}
							className="w-full lg:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-md font-bold shadow-sm"
						>
							<Plus className="h-4 w-4" />
							Tambah Admin
						</Button>
					)}
				</div>

				<div className="rounded-md border border-border bg-background overflow-hidden">
					<Table>
						<TableHeader className="bg-card">
							<TableRow>
								<TableHead className="px-6">Nama</TableHead>
								<TableHead className="px-6">Email</TableHead>
								<TableHead className="px-6">Role</TableHead>
								{isSuperAdmin && (
									<TableHead className="text-right px-6">Aksi</TableHead>
								)}
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.length > 0 ? (
								filteredUsers.map((u) => (
									<TableRow
										key={u.id}
										className="hover:bg-accent/50 transition-colors"
									>
										<TableCell className="font-medium text-foreground px-6">
											<div className="flex items-center gap-2">
												{u.name ?? "-"}
												{u.id === currentUser?.id && (
													<Badge className="text-[9px] bg-primary/10 text-primary border-none font-bold">
														Anda
													</Badge>
												)}
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground px-6">
											{u.email}
										</TableCell>
										<TableCell className="px-6">
											{u.role === "SUPERADMIN" ? (
												<Badge className="bg-stat-warning/10 text-stat-warning border-none font-medium gap-1">
													<ShieldCheck className="h-3 w-3" />
													Superadmin
												</Badge>
											) : (
												<Badge className="bg-stat-success/10 text-stat-success border-none font-medium gap-1">
													<Shield className="h-3 w-3" />
													Admin
												</Badge>
											)}
										</TableCell>
										{isSuperAdmin && (
											<TableCell className="text-right px-6">
												<DropdownMenu>
													<DropdownMenuTrigger
														render={
															<Button variant="ghost" className="h-8 w-8 p-0">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														}
													/>
													<DropdownMenuContent align="end">
														{u.role !== "SUPERADMIN" && (
															<>
																<DropdownMenuItem
																	onClick={() => openEdit(u)}
																	className="gap-2 focus:bg-accent cursor-pointer"
																>
																	<Edit className="h-4 w-4 text-muted-foreground" />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => setDeleteId(u.id)}
																	className="gap-2 text-destructive focus:text-destructive cursor-pointer"
																>
																	<Trash2 className="h-4 w-4" />
																	Hapus
																</DropdownMenuItem>
															</>
														)}
														{u.role === "SUPERADMIN" && (
															<DropdownMenuItem
																disabled
																className="text-muted-foreground/50 text-xs cursor-not-allowed"
															>
																Akun superadmin tidak dapat diubah
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										)}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={isSuperAdmin ? 5 : 4}
										className="h-64 text-center"
									>
										<div className="flex flex-col items-center justify-center space-y-4 max-w-[320px] mx-auto">
											<div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
												{isLoading ? (
													<RefreshCcw className="h-10 w-10 text-muted-foreground/30 animate-spin" />
												) : (
													<Search className="h-10 w-10 text-muted-foreground/30" />
												)}
											</div>
											<div className="space-y-1">
												<p className="font-bold text-lg text-foreground">
													{isLoading
														? "Memuat Data..."
														: "Admin tidak ditemukan"}
												</p>
												<p className="text-sm text-muted-foreground">
													{isLoading
														? "Mohon tunggu sebentar."
														: "Coba gunakan kata kunci pencarian yang berbeda."}
												</p>
											</div>
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
				open={isCreateSheetOpen || !!editUser}
				onOpenChange={(open) => {
					if (!open) {
						setIsCreateSheetOpen(false);
						setEditUser(null);
						resetForm();
					}
				}}
			>
				<SheetContent
					side="right"
					className="w-full sm:max-w-xl p-0 flex flex-col h-full"
				>
					<SheetHeader className="text-left border-b border-border p-8 pb-6 shrink-0">
						<SheetTitle className="text-2xl">
							{editUser ? "Edit Admin" : "Tambah Admin Baru"}
						</SheetTitle>
						<SheetDescription className="text-sm">
							{editUser
								? "Perbarui informasi akun admin."
								: "Buat akun admin baru untuk mengakses sistem."}
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto p-8 space-y-6">
						<div className="grid gap-2">
							<Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
								Nama
							</Label>
							<Input
								placeholder="Nama admin"
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
								Email
							</Label>
							<Input
								type="email"
								placeholder="admin@example.com"
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
								value={formEmail}
								onChange={(e) => setFormEmail(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
								{editUser
									? "Password Baru (kosongkan jika tidak diubah)"
									: "Password"}
							</Label>
							<Input
								type="password"
								placeholder={editUser ? "••••••••" : "Minimal 6 karakter"}
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
								value={formPassword}
								onChange={(e) => setFormPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className="px-8 py-6 border-t border-border shrink-0">
						<Button
							className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md"
							disabled={isCreating || isUpdating}
							onClick={handleSubmit}
						>
							{isCreating || isUpdating
								? "Menyimpan..."
								: editUser
									? "Simpan Perubahan"
									: "Tambah Admin"}
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Delete Confirm Dialog */}
			<Dialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<DialogContent className="max-w-[90vw] sm:max-w-md rounded-md">
					<DialogHeader>
						<DialogTitle>Konfirmasi Hapus</DialogTitle>
						<DialogDescription>
							Apakah Anda yakin ingin menghapus akun admin ini? Tindakan ini
							tidak dapat dibatalkan.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-row gap-2 mt-4">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => setDeleteId(null)}
						>
							Batal
						</Button>
						<Button
							variant="destructive"
							className="flex-1"
							disabled={isDeleting}
							onClick={() => deleteId && deleteUser(deleteId)}
						>
							{isDeleting ? "Menghapus..." : "Hapus Sekarang"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
