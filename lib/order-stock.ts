import type { Prisma } from "@prisma/client";
import { OrderError } from "@/lib/create-order";

/* Stock follows the order's life. A new order takes stock (lib/create-order.ts). When an order is
   cancelled or refunded the pieces go back on the shelf; if the shop re-opens a cancelled order the
   pieces are taken again (and it is refused if they are no longer there). Deleting an order that is
   still open returns its stock; deleting one that was already cancelled does not return it twice. */

type Tx = Prisma.TransactionClient;
type Item = { productId: string; variantId: string | null; quantity: number };

export const isClosedStatus = (status: string | null | undefined) => status === "CANCELLED" || status === "REFUNDED";

async function syncProductFlag(tx: Tx, productId: string) {
  const sum = await tx.productVariant.aggregate({ where: { productId }, _sum: { stock: true } });
  await tx.product.update({ where: { id: productId }, data: { inStock: (sum._sum.stock ?? 0) > 0 } });
}

/** put the order's pieces back in stock */
export async function returnStock(tx: Tx, items: Item[]) {
  for (const i of items) {
    if (!i.variantId) continue;
    // the colour may have been deleted since; then there is nothing to give back to
    const exists = await tx.productVariant.findUnique({ where: { id: i.variantId }, select: { id: true } });
    if (exists) await tx.productVariant.update({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
    await syncProductFlag(tx, i.productId);
  }
}

/** take the order's pieces out of stock again (a cancelled order was re-opened) */
export async function takeStock(tx: Tx, items: Item[]) {
  for (const i of items) {
    if (!i.variantId) continue;
    const r = await tx.productVariant.updateMany({
      where: { id: i.variantId, stock: { gte: i.quantity } },
      data: { stock: { decrement: i.quantity } },
    });
    if (r.count === 0) throw new OrderError("لا يمكن إعادة فتح الطلب: المخزون الحالي لا يكفي لأحد منتجاته", 409);
    await syncProductFlag(tx, i.productId);
  }
}
