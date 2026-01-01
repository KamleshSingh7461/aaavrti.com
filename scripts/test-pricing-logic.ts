
// Standalone Pricing Logic Checker

function calculatePricing(
    items: { price: number; quantity: number }[],
    offer?: { type: string; value: number; minAmount?: number; maxDiscount?: number }
) {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    let discountTotal = 0;

    if (offer) {
        if (subtotal >= (offer.minAmount || 0)) {
            if (offer.type === 'PERCENTAGE') {
                discountTotal = (subtotal * offer.value) / 100;
                if (offer.maxDiscount && discountTotal > offer.maxDiscount) {
                    discountTotal = offer.maxDiscount;
                }
            } else if (offer.type === 'FIXED') {
                discountTotal = offer.value;
            }
        }
    }

    if (discountTotal > subtotal) {
        discountTotal = subtotal;
    }

    const finalTotal = subtotal - discountTotal;

    const itemsWithDiscount = items.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        let itemShare = 0;

        if (subtotal > 0) {
            itemShare = (itemTotal / subtotal) * discountTotal;
        }

        const discountPerUnit = item.quantity > 0 ? itemShare / item.quantity : 0;

        return {
            originalPrice: item.price,
            discountPerUnit: Number(discountPerUnit.toFixed(2)),
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


async function test() {
    console.log("TESTING PRICING LOGIC...");

    // Scenario 1: Mixed Items, Percentage Discount
    const items = [
        { price: 100, quantity: 2 }, // $200
        { price: 50, quantity: 1 }   // $50
    ]; // Total $250

    // 10% OFF
    const result1 = calculatePricing(items, { type: 'PERCENTAGE', value: 10 });

    console.log("Scenario 1 (10% off 250):");
    console.log("Expected Discount: 25");
    console.log("Actual Discount:", result1.discountTotal);
    console.log("Items details:", JSON.stringify(result1.itemsWithDiscount, null, 2));

    // Scenario 2: Fixed Discount $100 on $250
    const result2 = calculatePricing(items, { type: 'FIXED', value: 100 });

    console.log("\nScenario 2 ($100 off 250):");
    console.log("Expected Discount: 100");
    console.log("Actual Discount:", result2.discountTotal);
    // Proration should be: 
    // Item 1 ($200 share of $250 is 0.8) -> $80 discount. Per unit $40.
    // Item 2 ($50 share of $250 is 0.2) -> $20 discount. Per unit $20.

    console.log("Items details:", JSON.stringify(result2.itemsWithDiscount, null, 2));

    // Scenario 3: Max Discount Cap
    // 50% off but max $50. Total $250 -> 50% is 125. Capped at 50.
    const result3 = calculatePricing(items, { type: 'PERCENTAGE', value: 50, maxDiscount: 50 });
    console.log("\nScenario 3 (50% off capped at 50):");
    console.log("Actual Discount:", result3.discountTotal);

    if (result1.discountTotal === 25 && result2.discountTotal === 100 && result3.discountTotal === 50) {
        console.log("\n✅ ALL TESTS PASSED");
    } else {
        console.log("\n❌ TESTS FAILED");
    }
}

// Mocking required if running independently? 
// Actually I'll just write a standalone TS file that copies the function to avoid import headers issues if not compiled.
// Or I can rely on my previous edit being correct and ask User to verify.

// I will try to run this simple logic check.
test().catch(console.error);
