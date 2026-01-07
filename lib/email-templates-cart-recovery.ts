// Add this to the existing email-templates.ts file
import { baseTemplate } from './email-templates';

export const cartRecoveryTemplate = (order: any, restoreLink: string) => {
    const itemsHtml = order.items.slice(0, 4).map((item: any) => {
        const product = item.productId || item.product;
        const image = product?.images?.[0] || item.image || '/placeholder.jpg';
        const name = product?.name_en || item.name || 'Product';
        const price = item.price || product?.price || 0;

        return `
            <div style="display: inline-block; width: 48%; vertical-align: top; padding: 10px; box-sizing: border-box;">
                <div style="border: 1px solid #ddd; padding: 10px; background: #fff;">
                    <img src="${image}" alt="${name}" style="width: 100%; height: auto; margin-bottom: 10px;" />
                    <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px;">${name}</div>
                    <div style="font-size: 16px; color: #B12704; font-weight: bold;">₹${price.toLocaleString('en-IN')}</div>
                </div>
            </div>
        `;
    }).join('');

    const totalItems = order.items.length;
    const moreItems = totalItems > 4 ? `<p style="text-align: center; margin-top: 15px; color: #666;">+ ${totalItems - 4} more items</p>` : '';

    return baseTemplate(`
        <div style="text-align: center; padding: 20px 0;">
            <h2 style="font-family: Arial, sans-serif; color: #232f3e; margin-bottom: 10px;">You Left Something Behind!</h2>
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                Hi ${order.userId?.name || 'there'}, we noticed you didn't complete your order. Your items are still waiting for you!
            </p>
        </div>

        <div style="background: #f7f7f7; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="font-size: 18px; color: #cc6600; margin-bottom: 15px; text-align: center;">Your Cart Items</h3>
            <div style="text-align: center;">
                ${itemsHtml}
            </div>
            ${moreItems}
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏰ <strong>Hurry!</strong> Items in your cart are selling fast. Complete your order now to avoid missing out!
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${restoreLink}" class="btn" style="font-size: 16px; padding: 14px 40px;">
                Complete My Order
            </a>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            <h4 style="font-size: 16px; color: #333; margin-bottom: 15px;">Why Shop With Us?</h4>
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
                <div style="text-align: center; flex: 1; min-width: 150px; padding: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">🚚</div>
                    <div style="font-size: 13px; font-weight: bold;">Free Shipping</div>
                    <div style="font-size: 12px; color: #666;">On prepaid orders</div>
                </div>
                <div style="text-align: center; flex: 1; min-width: 150px; padding: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">✓</div>
                    <div style="font-size: 13px; font-weight: bold;">100% Authentic</div>
                    <div style="font-size: 12px; color: #666;">Genuine products</div>
                </div>
                <div style="text-align: center; flex: 1; min-width: 150px; padding: 10px;">
                    <div style="font-size: 24px; margin-bottom: 5px;">↩️</div>
                    <div style="font-size: 13px; font-weight: bold;">Easy Returns</div>
                    <div style="font-size: 12px; color: #666;">7-day return policy</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 13px; color: #666;">
                Need help? <a href="https://ournika.com/contact" style="color: #007185;">Contact our support team</a>
            </p>
        </div>
    `);
};
