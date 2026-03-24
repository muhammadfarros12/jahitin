"use client"
import { useState } from "react";
import { useCreateOrder } from "@/modules/orders/hooks/useCreateOrder";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
	onClose: () => void;
}

export function CreateOrderModal({ onClose }: Props) {
	const [customerName, setCustomerName] = useState("");
	const [orderDescription, setOrderDescription] = useState("");
	const [estimatedFinishedDate, setEstimatedFinishedDate] = useState("");

	const { mutate: createOrder, isPending } = useCreateOrder(onClose);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		createOrder({
			customer_name: customerName,
			order_description: orderDescription,
			estimated_finished_date: estimatedFinishedDate,
		});
	}

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Buat Order Baru</DialogTitle>
					<DialogDescription>
						Kode order akan digenerate otomatis setelah order berhasil dibuat.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="customer_name">Nama Pemesan</Label>
						<Input
							id="customer_name"
							required
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Contoh: Budi Santoso"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="order_description">Deskripsi Order</Label>
						<Textarea
							id="order_description"
							required
							value={orderDescription}
							onChange={(e) => setOrderDescription(e.target.value)}
							placeholder="Contoh: Kaos polos 50 pcs warna hitam, ukuran M-XL"
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="estimated_date">Estimasi Tanggal Selesai</Label>
						<Input
							id="estimated_date"
							type="date"
							required
							value={estimatedFinishedDate}
							onChange={(e) => setEstimatedFinishedDate(e.target.value)}
							min={new Date().toISOString().split("T")[0]}
						/>
					</div>

					<DialogFooter className="pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Batal
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Menyimpan..." : "Buat Order"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
