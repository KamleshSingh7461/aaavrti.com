
export interface CartItemType {
    price: number;
    quantity: number;
    // ... other props
}

export interface PricingResult {
    subtotal: number;
    discountTotal: number;
    finalTotal: number;
    itemsWithDiscount: {
        originalPrice: number;
        discountPerUnit: number; // Prorated discount
        finalPrice: number;
    }[];
}

/**
 * Calculates the total order value and safely distributes discount across items.
 * PRO-RATE LOGIC:
 * If we have $10 off on a $100 order of 2 items ($40 and $60),
 * Item 1 gets $4 off.
 * Item 2 gets $6 off.
 * This ensures if Item 1 is returned, we refund $36, not $40.
 */
export function calculatePricing(
    items: { price: number; quantity: number }[],
    offer?: { type: string; value: number; minAmount?: number; maxDiscount?: number }
): PricingResult {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    let discountTotal = 0;

    if (offer) {
        // 1. Check Min Amount
        if (subtotal >= (offer.minAmount || 0)) {
            // 2. Calculate Raw Discount
            if (offer.type === 'PERCENTAGE') {
                discountTotal = (subtotal * offer.value) / 100;
                // 3. Cap at Max Discount
                if (offer.maxDiscount && discountTotal > offer.maxDiscount) {
                    discountTotal = offer.maxDiscount;
                }
            } else if (offer.type === 'FIXED') {
                discountTotal = offer.value;
            }
        }
    }

    // Prevent negative total
    if (discountTotal > subtotal) {
        discountTotal = subtotal;
    }

    const finalTotal = subtotal - discountTotal;

    // Distribute discount
    // We strictly use: ItemWeight = (ItemPrice * Qty) / Subtotal
    // ItemDiscount = TotalDiscount * ItemWeight
    // ItemDiscountPerUnit = ItemDiscount / Qty

    // To handle rounding errors (e.g. 10/3), we accumulate "applied discount" and apply remainder to last item?
    // Or just Keep it simple with float for now, but usually for DB we want 2 decimal precision.
    // For now we will calculate per-unit discount.

    let distributedDiscount = 0; // Keeping for logic if needed later

    const itemsWithDiscount = items.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        let itemShare = 0;

        if (subtotal > 0) {
            itemShare = (itemTotal / subtotal) * discountTotal;
        }

        // Handle rounding (JavaScript float issue)
        // Ideally we work with cents/paisa integers. 
        // For simplicity here, we trust basic float math then round at end.

        const discountPerUnit = item.quantity > 0 ? itemShare / item.quantity : 0;

        return {
            originalPrice: item.price,
            discountPerUnit: Number(discountPerUnit.toFixed(2)), // Store safe decimal
            finalPrice: item.price - Number(discountPerUnit.toFixed(2))
        };
    });

    return {
        subtotal,
        discountTotal: Number(discountTotal.toFixed(2)),
        finalTotal: Number(finalTotal.toFixed(2)),
        itemsWithDiscount
    };
}
