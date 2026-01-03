
export const emailStyles = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f2f2f2; }
    .container { max-width: 640px; margin: 20px auto; background-color: #ffffff; overflow: hidden; }
    .top-nav { background-color: #232f3e; padding: 10px 20px; text-align: right; font-size: 13px; color: #ffffff; }
    .top-nav a { color: #ffffff; text-decoration: none; margin-left: 15px; font-family: Arial, sans-serif; }
    .header { text-align: center; padding: 25px 0; border-bottom: 3px solid #eee; background-color: #ffffff; }
    .logo-img { max-width: 140px; height: auto; }
    .main-nav { background-color: #f8f9fa; padding: 12px 0; text-align: center; border-bottom: 1px solid #e7e7e7; }
    .main-nav a { color: #333; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500; text-transform: uppercase; font-family: Arial, sans-serif; }
    .content { padding: 30px 20px; }
    .product-grid { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .product-cell { width: 50%; padding: 10px; vertical-align: top; text-align: center; }
    .product-box { border: 1px solid #eee; padding: 15px; border-radius: 4px; background: #fff; }
    .product-img { max-width: 100%; height: 180px; object-fit: cover; margin-bottom: 15px; }
    .price { font-size: 18px; color: #B12704; font-weight: 700; }
    .price-old { font-size: 13px; color: #565959; text-decoration: line-through; margin-left: 5px; }
    .discount-badge { background-color: #CC0C39; color: white; padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 2px; margin-right: 5px; }
    .footer { text-align: center; padding: 30px 20px; font-size: 12px; color: #555; background-color: #fcfcfc; border-top: 1px solid #eee; }
    .footer a { color: #007185; text-decoration: none; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #FFD814; border: 1px solid #FCD200; color: #111; text-decoration: none; border-radius: 20px; font-weight: 500; margin-top: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .btn:hover { background-color: #F7CA00; }
    .otp-box { background-color: #f0f2f2; padding: 20px; text-align: center; border-radius: 4px; font-size: 32px; letter-spacing: 5px; font-weight: bold; margin: 25px 0; border: 1px solid #d5d9d9; color: #111; }
    .section-title { font-size: 20px; font-weight: bold; color: #cc6600; margin-bottom: 10px; font-family: Arial, sans-serif; }
`;

// Helper to generate the Amazon-style 2-column grid
const generateProductGrid = (items: any[]) => {
    let html = '<table class="product-grid" cellpadding="0" cellspacing="0">';
    for (let i = 0; i < items.length; i += 2) {
        html += '<tr>';
        // Item 1
        html += `<td class="product-cell">
            <div class="product-box">
                <img src="${items[i].image || 'https://aaavrti.shop/placeholder.jpg'}" alt="${items[i].name}" class="product-img" onerror="this.src='https://placehold.co/400x400?text=Aaavrti'"/>
                <div style="height: 40px; overflow: hidden; margin-bottom: 5px; font-size: 14px; line-height: 1.4;">
                    <a href="https://aaavrti.shop/product/${items[i].slug || '#'}" style="text-decoration: none; color: #007185;">${items[i].name}</a>
                </div>
                <div style="margin-top: 5px;">
                    ${items[i].discount > 0 ? `<span class="discount-badge">-${items[i].discount}%</span>` : ''}
                    <span class="price">₹${items[i].price.toLocaleString()}</span>
                </div>
            </div>
        </td>`;

        // Item 2 (if exists)
        if (i + 1 < items.length) {
            const item = items[i + 1];
            html += `<td class="product-cell">
                <div class="product-box">
                    <img src="${item.image || 'https://aaavrti.shop/placeholder.jpg'}" alt="${item.name}" class="product-img" onerror="this.src='https://placehold.co/400x400?text=Aaavrti'"/>
                    <div style="height: 40px; overflow: hidden; margin-bottom: 5px; font-size: 14px; line-height: 1.4;">
                        <a href="https://aaavrti.shop/product/${item.slug || '#'}" style="text-decoration: none; color: #007185;">${item.name}</a>
                    </div>
                    <div style="margin-top: 5px;">
                        ${item.discount > 0 ? `<span class="discount-badge">-${item.discount}%</span>` : ''}
                        <span class="price">₹${item.price.toLocaleString()}</span>
                    </div>
                </div>
            </td>`;
        } else {
            html += '<td></td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
};

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
        <!-- Top Utility Bar -->
        <div class="top-nav">
             <a href="https://aaavrti.shop">Aaavrti.shop</a>
             <a href="https://aaavrti.shop/account/orders">Your Orders</a>
             <a href="https://aaavrti.shop/account">Your Account</a>
             <a href="https://aaavrti.shop/cart">Cart</a>
        </div>

        <!-- Logo Header -->
        <div class="header">
            <a href="https://aaavrti.shop" style="text-decoration: none;">
                <img src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png" alt="AAAVRTI" class="logo-img" style="vertical-align: middle;"/>
            </a>
        </div>

        <!-- Category Nav -->
        <div class="main-nav">
            <a href="https://aaavrti.shop">Home</a>
            <a href="https://aaavrti.shop/new-arrivals">New Arrivals</a>
            <a href="https://aaavrti.shop/collections/men">Men</a>
            <a href="https://aaavrti.shop/collections/women">Women</a>
            <a href="https://aaavrti.shop/sale" style="color: #B12704;">Sale</a>
        </div>

        <div class="content">
            ${content}
        </div>

        <div class="footer">
            <p>Please note that product prices and availability are subject to change.</p>
            <p>&copy; ${new Date().getFullYear()} Aaavrti.shop, Inc. or its affiliates.</p>
            <p style="margin-top: 15px;">
                <a href="https://aaavrti.shop/pages/privacy-policy">Privacy Policy</a> | 
                <a href="https://aaavrti.shop/pages/contact">Contact Us</a> | 
                <a href="https://aaavrti.shop/unsubscribe">Unsubscribe</a>
            </p>
            <p style="color: #999; margin-top: 10px;">d/206 Jankalyan CHS, Mumbai, India</p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeTemplate = (name: string) => baseTemplate(`
    <h2 class="section-title" style="color: #000; text-align: center;">Welcome to Aaavrti!</h2>
    <p style="text-align: center; font-size: 16px;">Hello ${name || 'Friend'}, thanks for joining us.</p>
    
    <div style="background: linear-gradient(to right, #232f3e, #1a2530); color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; font-size: 24px; color: #fff;">Enjoy 10% OFF</h3>
        <p style="color: #ccc; margin: 10px 0 20px;">Use this code on your first order:</p>
        <div style="background: white; color: #000; padding: 10px 20px; font-weight: bold; letter-spacing: 2px; font-size: 20px; display: inline-block; border-radius: 4px;">WELCOME10</div>
        <div style="margin-top: 20px;">
            <a href="https://aaavrti.shop/collections/all" class="btn" style="background-color: #FFD814; border-color: #FCD200;">Shop Now</a>
        </div>
    </div>
`);

export const otpTemplate = (otp: string) => baseTemplate(`
    <div style="text-align: center; padding: 20px 0;">
        <h2 style="font-family: Arial, sans-serif;">Verify your email address</h2>
        <p>Use the following One-Time Password (OTP) to complete your Aaavrti account creation.</p>
        <div class="otp-box">${otp}</div>
        <p style="font-size: 13px; color: #666;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
    </div>
`);

export const orderConfirmationTemplate = (order: any) => {
    const itemsHtml = order.items.map((item: any) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <div style="font-weight: 700; color: #007185;">${item.name}</div>
                <div style="font-size: 12px; color: #555;">Qty: ${item.quantity}</div>
            </td>
            <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">₹${item.price.toLocaleString()}</td>
        </tr>
    `).join('');

    return baseTemplate(`
        <h2 style="color: #232f3e; font-family: Arial, sans-serif;">Order Confirmation</h2>
        <p style="font-size: 16px;">Hello ${order.customerName},</p>
        <p>Thanks for your order. We’ll let you know once your item(s) have shipped.</p>

        <div style="border: 1px solid #ccc; border-radius: 4px; overflow: hidden; margin: 20px 0;">
            <div style="background: #f0f2f2; padding: 15px; border-bottom: 1px solid #ccc;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555;">
                     <div><strong>ORDER PLACED</strong><br>${new Date(order.createdAt).toLocaleDateString()}</div>
                     <div><strong>ORDER #</strong><br>${order.orderNumber}</div>
                     <div><strong>TOTAL</strong><br>₹${order.total.toLocaleString()}</div>
                </div>
            </div>
            <div style="padding: 15px;">
                  <h3 style="font-size: 14px; color: #cc6600; margin-top: 0;">Items Ordered</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      ${itemsHtml}
                  </table>
                  
                  <div style="text-align: right; margin-top: 20px; font-size: 14px;">
                     <div style="margin-bottom: 5px;">Subtotal: ₹${order.subtotal.toLocaleString()}</div>
                     <div style="margin-bottom: 5px; color: #B12704; font-weight: bold;">Grand Total: ₹${order.total.toLocaleString()}</div>
                  </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 4px;">
            <h3 style="font-size: 16px; margin-top: 0; color: #cc6600;">Delivery Address</h3>
            <p style="font-size: 14px; line-height: 1.5; color: #333;">
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}<br>
                Phone: ${order.shippingAddress.phone}
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="https://aaavrti.shop/account/orders/${order.id}" class="btn">View or Manage Order</a>
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
        <!-- Raw Content Area -->
        <div class="content" style="padding: 0;">
            ${content}
        </div>

        <!-- Mandatory Unsubscribe Footer -->
        <div class="footer" style="padding-top: 20px; border-top: none;">
            <p style="font-size: 11px; color: #999;">
                <a href="${unsubscribeLink}">Unsubscribe</a> | <a href="https://aaavrti.shop/pages/privacy-policy">Privacy Policy</a>
            </p>
            <p style="font-size: 11px; color: #ccc;">Aaavrti.shop</p>
        </div>
    </div>
</body>
</html>
`;

// Cart Recovery (Amazon-style "You might like" grid)
export const recoveryTemplate = (recoveryLink: string, items: any[]) => {
    // Try to format items for the grid if they have product data, else fallback list
    const gridItems = items.map(i => ({
        name: i.product?.name_en || i.name || 'Product',
        image: i.product?.images?.[0] || i.image, // Handle different shapes
        price: i.price || i.product?.price || 0,
        slug: i.slug || i.product?.slug,
        discount: i.product?.discount_percent || 0
    }));

    return baseTemplate(`
    <h2 style="font-family: Arial, sans-serif; color: #333;">You have items waiting in your cart</h2>
    <p>Hi there, we noticed you left some great finds behind. Complete your order now before they sell out!</p>
    
    <div style="text-align: center; margin-bottom: 30px;">
        <a href="${recoveryLink}" class="btn" style="width: 200px;">Proceed to Checkout</a>
    </div>

    <h3 class="section-title" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Your Cart Items</h3>
    ${generateProductGrid(gridItems)}
`);
};
