
export const emailStyles = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { text-align: center; padding: 30px 20px; border-bottom: 2px solid #f0f0f0; background-color: #ffffff; }
    .logo-img { max-width: 150px; height: auto; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 3px; color: #000; text-decoration: none; font-family: 'Playfair Display', 'Georgia', serif; text-transform: uppercase; }
    .content { padding: 40px 30px; }
    .footer { text-align: center; padding: 30px 20px; font-size: 13px; color: #888; background-color: #f4f4f4; border-top: 1px solid #e0e0e0; }
    .footer a { color: #555; text-decoration: underline; }
    .btn { display: inline-block; padding: 14px 30px; background-color: #000000; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; transition: background-color 0.3s; }
    .btn:hover { background-color: #333333; }
    .otp-box { background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 25px 0; border: 1px dashed #ccc; color: #000; }
    .order-summary { width: 100%; border-collapse: collapse; margin-top: 25px; }
    .order-summary th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #555; font-size: 14px; text-transform: uppercase; }
    .order-summary td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
    .total-row { font-weight: bold; font-size: 18px; color: #000; }
    .highlight { color: #000; font-weight: 600; }
    h1, h2, h3 { color: #111; margin-top: 0; font-family: 'Playfair Display', 'Georgia', serif; }
    p { margin-bottom: 15px; color: #444; }
    .social-links { margin-top: 15px; }
    .social-links a { margin: 0 5px; text-decoration: none; font-size: 20px; }
`;

export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>${emailStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Use logo image if available, otherwise text -->
            <a href="https://aaavrti.shop" style="text-decoration: none;">
                <img src="https://aaavrti.shop/aaavrti_logo.png" alt="AAAVRTI" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" />
                <span class="logo-text" style="display: none;">AAAVRTI</span>
            </a>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aaavrti. All rights reserved.</p>
            <p>d/206 Jankalyan CHS, Mumbai, India</p>
            <div class="social-links">
                <!-- Add actual social links if available -->
                <a href="#">Instagram</a> • <a href="#">Facebook</a> • <a href="#">Twitter</a>
            </div>
            <p style="margin-top: 15px; font-size: 11px; color: #aaa;">
                You verified this email to receive notifications from Aaavrti.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeTemplate = (name: string) => baseTemplate(`
    <div style="text-align: center;">
        <h2>Welcome to the Family, ${name || 'Friend'}!</h2>
        <p style="font-size: 16px;">We are honored to have you with us.</p>
    </div>
    <p>At <strong>Aaavrti</strong>, we don't just sell clothes; we weave heritage into modern elegance. Thank you for joining our community of connoisseurs.</p>
    
    <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #000; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;">As a special welcome gift, enjoy <strong>10% OFF</strong> your first purchase.</p>
        <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">Use Code: WELCOME10</p>
    </div>

    <div style="text-align: center;">
        <a href="https://aaavrti.shop/collections/all" class="btn">Start Your Journey</a>
    </div>
`);

export const otpTemplate = (otp: string) => baseTemplate(`
    <div style="text-align: center;">
        <h2>Verify Your Account</h2>
        <p>You are just one step away from completing your registration.</p>
    </div>
    <p>Please use the verification code below to confirm your email address. This code is valid for <strong>10 minutes</strong>.</p>
    <div class="otp-box">${otp}</div>
    <p style="font-size: 14px; text-align: center;">If you didn't request this code, please ignore this email. Your account remains secure.</p>
`);

export const orderConfirmationTemplate = (order: any) => {
    const itemsHtml = order.items.map((item: any) => `
        <tr>
            <td>
                <div class="highlight">${item.name}</div>
                <div style="font-size: 13px; color: #777;">Quantity: ${item.quantity}</div>
            </td>
            <td style="text-align: right; white-space: nowrap;">₹${item.price.toLocaleString()}</td>
        </tr>
    `).join('');

    return baseTemplate(`
        <h2>Order Confirmed</h2>
        <p>Dear ${order.customerName},</p>
        <p>Thank you for shopping with us! Your order <strong>#${order.orderNumber}</strong> has been successfully placed. We are preparing it with care.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 25px 0; display: flex; justify-content: space-between;">
            <div>
                <div style="font-size: 12px; color: #666; text-transform: uppercase;">Order Date</div>
                <div style="font-weight: 600;">${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
             <div>
                <div style="font-size: 12px; color: #666; text-transform: uppercase;">Order ID</div>
                <div style="font-weight: 600;">#${order.orderNumber}</div>
            </div>
        </div>

        <table class="order-summary">
            <thead>
                <tr>
                    <th>Item</th>
                    <th style="text-align: right;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td style="padding-top: 20px;">Subtotal</td>
                    <td style="text-align: right; padding-top: 20px;">₹${order.subtotal.toLocaleString()}</td>
                </tr>
                 ${order.discount > 0 ? `
                <tr>
                    <td>Discount</td>
                    <td style="text-align: right; color: #2e7d32;">-₹${order.discount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Shipping</td>
                    <td style="text-align: right;">Free</td>
                </tr>
                <tr class="total-row">
                    <td style="padding-top: 15px; border-top: 2px solid #000;">Total</td>
                    <td style="text-align: right; padding-top: 15px; border-top: 2px solid #000;">₹${order.total.toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3 style="font-size: 18px; margin-bottom: 15px;">Shipping to:</h3>
            <p style="color: #555; line-height: 1.8;">
                <strong>${order.shippingAddress.name}</strong><br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}<br>
                <span style="color: #777;">Ph: ${order.shippingAddress.phone}</span>
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <a href="https://aaavrti.shop/account/orders/${order.id}" class="btn">View Order Details</a>
        </div>
    `);
};

export const newsletterTemplate = (content: string, unsubscribeLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>${emailStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://aaavrti.shop" style="text-decoration: none;">
                 <img src="https://aaavrti.shop/aaavrti_logo.png" alt="AAAVRTI" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" />
                <span class="logo-text" style="display: none;">AAAVRTI</span>
            </a>
        </div>
        <div class="content" style="font-size: 16px; line-height: 1.8;">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aaavrti. All rights reserved.</p>
            <p style="margin-top: 20px;">
                <a href="${unsubscribeLink}" style="color: #888; text-decoration: underline;">Unsubscribe from specific updates</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

export const recoveryTemplate = (recoveryLink: string, items: any[]) => baseTemplate(`
    <div style="text-align: center;">
        <h2>Don't Miss Out!</h2>
        <p>You left some timeless pieces in your cart.</p>
    </div>
    
    <div style="margin: 30px 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        ${items.map((item: any) => `
            <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background-color: #fff;">
                 <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 16px;">${item.product?.name_en || 'Product'}</div>
                    <div style="font-size: 12px; color: #888;">Complete your purchase before it's gone.</div>
                 </div>
            </div>
        `).join('')}
    </div>

    <div style="text-align: center;">
        <a href="${recoveryLink}" class="btn">Return to Cart</a>
    </div>
`);
