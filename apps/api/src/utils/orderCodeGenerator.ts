import { prisma } from "./prisma";

/**
 * Generate unique order code with format: JAH + YYMMDD + 3 random digits
 * Example: JAH250215001
 */
export async function generateOrderCode(): Promise<string> {
  const generateCode = (): string => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `JAH${yy}${mm}${dd}${randomNum}`;
  };

  let orderCode: string;
  let exists: boolean;

  do {
    orderCode = generateCode();
    const existingOrder = await prisma.order.findUnique({
      where: { order_code: orderCode },
      select: { id: true },
    });
    exists = !!existingOrder;
  } while (exists);

  return orderCode;
}
