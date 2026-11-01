import { prisma } from "@/lib/prisma";
import { buyXGetYOffer, effectivePrice, freeUnits, type OfferLike } from "@/lib/effective-price";

/* One way to place an order, for a signed-in customer and for a guest.
   The browser says only WHICH colour, WHICH size and HOW MANY. Everything that costs money is read
   here from the database: the price (with the live offer), the stock, whether the product is on sale
   at all. Stock is taken inside one transaction with a condition (stock >= quantity), so two people
   buying the last piece cannot both succeed. */

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type OrderLine = { productId: string; variantId?: string | null; quantity: number; size?: string | null };

export type OrderCustomer = {
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  shippingAddressId?: string | null;
  notes?: string | null;
};

const MAX_LINES = 20;
const MAX_QTY = 10;

function newOrderNumber() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function placeOrder(customer: OrderCustomer, rawLines: OrderLine[]) {
  if (!Array.isArray(rawLines) || rawLines.length === 0) throw new OrderError("السلة فارغة");
  if (rawLines.length > MAX_LINES) throw new OrderError("عدد المنتجات في الطلب كبير جدًا");

  // the same colour + size twice in the cart becomes one line
  const merged = new Map<string, OrderLine>();
  for (const l of rawLines) {
    const qty = Number(l.quantity);
    if (!l.productId || !l.variantId || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw new OrderError("بيانات أحد المنتجات غير صحيحة، أعد إضافته إلى السلة");
    }
    const key = `${l.variantId}|${l.size ?? ""}`;
    const prev = merged.get(key);
    if (prev) prev.quantity = Math.min(MAX_QTY, prev.quantity + qty);
    else merged.set(key, { productId: l.productId, variantId: l.variantId, quantity: qty, size: l.size ?? null });
  }
  const lines = [...merged.values()];

  return prisma.$transaction(async (tx) => {
    const items: {
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      originalPrice: number;
      discountAmount: number;
      productName: string;
      variantDetails: string;
    }[] = [];
    const touchedProducts = new Set<string>();
    const offerOf = new Map<string, OfferLike | null>();

    for (const l of lines) {
      const variant = await tx.productVariant.findUnique({
        where: { id: l.variantId! },
        include: { product: { include: { offer: true } } },
      });
      if (!variant || variant.productId !== l.productId) throw new OrderError("أحد المنتجات لم يعد موجودًا");
      const product = variant.product;
      if (!product.isActive) throw new OrderError(`المنتج "${product.name}" غير متاح حاليًا`);

      if (variant.sizes.length > 0) {
        if (!l.size || !variant.sizes.includes(l.size)) throw new OrderError(`اختر المقاس للمنتج "${product.name}"`);
      }

      // the stock is taken here, only if there is enough left (one atomic step)
      const taken = await tx.productVariant.updateMany({
        where: { id: variant.id, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (taken.count === 0) {
        throw new OrderError(`الكمية المطلوبة من "${product.name}" (${variant.color}) غير متوفرة`, 409);
      }
      touchedProducts.add(product.id);
      offerOf.set(product.id, product.offer);

      const live = effectivePrice(product);
      items.push({
        productId: product.id,
        variantId: variant.id,
        quantity: l.quantity,
        price: live.finalPrice,
        originalPrice: product.basePrice,
        discountAmount: Math.max(0, Math.round((product.basePrice - live.finalPrice) * 100) / 100),
        productName: product.name,
        variantDetails: [variant.color, l.size].filter(Boolean).join(" / "),
      });
    }

    // a product with no stock left in any colour is marked out of stock
    for (const pid of touchedProducts) {
      const sum = await tx.productVariant.aggregate({ where: { productId: pid }, _sum: { stock: true } });
      if ((sum._sum.stock ?? 0) <= 0) await tx.product.update({ where: { id: pid }, data: { inStock: false } });
    }

    const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;

    // "buy X, get Y free": for every X+Y pieces of the same product (any colours / sizes together),
    // Y are free. The unit price on each line stays as it is; the free pieces come off the order total
    // (totalAmount = before, finalAmount = what is paid) and are marked on the line.
    let offerDiscount = 0;
    const qtyOf = new Map<string, number>();
    for (const i of items) qtyOf.set(i.productId, (qtyOf.get(i.productId) ?? 0) + i.quantity);
    for (const [pid, qty] of qtyOf) {
      const rule = buyXGetYOffer(offerOf.get(pid));
      if (!rule) continue;
      const free = freeUnits(qty, rule.buy, rule.get);
      if (free === 0) continue;
      const lines = items.filter((i) => i.productId === pid);
      offerDiscount += free * lines[0].price;
      let left = free;
      for (const line of lines) {
        const f = Math.min(left, line.quantity);
        if (f > 0) line.variantDetails = `${line.variantDetails} · +${f} مجانًا`;
        left -= f;
      }
    }
    offerDiscount = Math.round(offerDiscount * 100) / 100;
    const total = subtotal;
    const finalAmount = Math.round((subtotal - offerDiscount) * 100) / 100;

    let order = null;
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      try {
        order = await tx.order.create({
          data: {
            orderNumber: newOrderNumber(),
            userId: customer.userId,
            totalAmount: total,
            finalAmount,
            shippingAddressId: customer.shippingAddressId ?? null,
            customerName: customer.name,
            customerPhone: customer.phone,
            shippingAddress: customer.address,
            shippingCity: customer.city,
            notes: customer.notes || null,
            statusHistory: ["PENDING"],
            orderItems: { create: items },
          },
          include: { orderItems: true },
        });
      } catch (e: unknown) {
        // an order number that already exists: try another
        if (!(typeof e === "object" && e && (e as { code?: string }).code === "P2002")) throw e;
      }
    }
    if (!order) throw new OrderError("تعذّر إنشاء رقم الطلب، حاول مرة أخرى", 500);

    return order;
  });
}
