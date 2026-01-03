
export const emailStyles = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #000; text-decoration: none; font-family: 'Georgia', serif; }
    .content { padding: 30px 0; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 500; margin-top: 20px; }
    .otp-box { background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 4px; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0; }
    .order-summary { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .order-summary th { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
    .order-summary td { padding: 10px; border-bottom: 1px solid #eee; }
    .total-row { font-weight: bold; font-size: 16px; }
`;

export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${emailStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://aaavrti.shop" class="logo">AAAVRTI</a>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aaavrti. All rights reserved.</p>
            <p>d/206 Jankalyan CHS, Mumbai, India</p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeTemplate = (name: string) => baseTemplate(`
    <h2>Welcome to Aaavrti, ${name || 'Friend'}!</h2>
    <p>We are delighted to have you join our community of heritage lovers.</p>
    <p>At Aaavrti, we bring you authentic, timeless fashion that speaks of tradition and elegance.</p>
    <p>As a welcome gift, use code <strong>WELCOME10</strong> for 10% off your first order.</p>
    <div style="text-align: center;">
        <a href="https://aaavrti.shop/collections/all" class="btn" style="color: #fff;">Explore Collection</a>
    </div>
`);

export const otpTemplate = (otp: string) => baseTemplate(`
    <h2>Verify Your Account</h2>
    <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your account:</p>
    <div class="otp-box">${otp}</div>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
`);

export const orderConfirmationTemplate = (order: any) => {
    const itemsHtml = order.items.map((item: any) => `
        <tr>
            <td>
                <div style="font-weight: 500;">${item.name}</div>
                <div style="font-size: 12px; color: #666;">Qty: ${item.quantity}</div>
            </td>
            <td style="text-align: right;">₹${item.price.toLocaleString()}</td>
        </tr>
    `).join('');

    return baseTemplate(`
        <h2>Order Confirmed!</h2>
        <p>Hi ${order.customerName},</p>
        <p>Thank you for your order. We're getting it ready to be shipped. We will notify you once it's on its way.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0;"><strong>Order ID:</strong> #${order.orderNumber}</p>
            <p style="margin: 5px 0 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
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
                    <td style="padding-top: 15px;"><strong>Subtotal</strong></td>
                    <td style="text-align: right; padding-top: 15px;">₹${order.subtotal.toLocaleString()}</td>
                </tr>
                 ${order.discount > 0 ? `
                <tr>
                    <td>Discount</td>
                    <td style="text-align: right; color: green;">-₹${order.discount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td>Total</td>
                    <td style="text-align: right;">₹${order.total.toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>

        <div style="margin-top: 30px;">
            <h3>Shipping Address</h3>
            <p style="color: #555;">
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}<br>
                Ph: ${order.shippingAddress.phone}
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://aaavrti.shop/account/orders/${order.id}" class="btn" style="color: #fff;">View Order Details</a>
        </div>
    `);
};

export const newsletterTemplate = (content: string, unsubscribeLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${emailStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://aaavrti.shop" class="logo">AAAVRTI</a>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Aaavrti. All rights reserved.</p>
            <p>You are receiving this email because you subscribed to our newsletter.</p>
            <p><a href="${unsubscribeLink}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
`;

export const recoveryTemplate = (recoveryLink: string, items: any[]) => baseTemplate(`
    <h2>You left something behind!</h2>
    <p>We noticed you left some great items in your cart. They are selling out fast, so grab them before they are gone!</p>
    
    <div style="margin: 20px 0;">
        ${items.map((item: any) => `
            <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                 <div style="flex: 1;"><strong>${item.product?.name_en || 'Product'}</strong></div>
            </div>
        `).join('')}
    </div>

    <div style="text-align: center;">
        <a href="${recoveryLink}" class="btn" style="color: #fff;">Complete Your Purchase</a>
    </div>
`);
