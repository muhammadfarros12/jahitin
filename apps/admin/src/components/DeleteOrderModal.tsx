"use client"
import { useDeleteOrder } from "@/modules/orders/hooks/useDeleteOrder";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
	orderId: number;
	orderCode: string;
	customerName: string;
	onClose: () => void;
}

export function DeleteOrderModal({
	orderId,
	orderCode,
	customerName,
	onClose,
}: Props) {
	const { mutate: deleteOrder, isPending } = useDeleteOrder(onClose);

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
                    <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center mb-4">
					    <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
					<DialogTitle>Hapus Order</DialogTitle>
					<DialogDescription>
						Apakah Anda yakin ingin menghapus order <span className="font-mono font-bold text-foreground">{orderCode}</span> atas nama <span className="font-bold text-foreground">{customerName}</span>?
					</DialogDescription>
				</DialogHeader>

                <div className="py-2">
					<p className="text-xs text-destructive font-medium">
						Tindakan ini permanen dan tidak dapat dibatalkan.
					</p>
                </div>

				<DialogFooter className="pt-4">
					<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
						Batal
					</Button>
					<Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => deleteOrder(orderId)} 
                        disabled={isPending}
                    >
						{isPending ? "Menghapus..." : "Hapus Order"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
