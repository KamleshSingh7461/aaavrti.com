# Demo User Credentials for Razorpay Testing

## Login Credentials

**Website:** https://aaavrti.shop  
**Login URL:** https://aaavrti.shop/auth/login

```
📧 Email:    demo@aaavrti.com
🔑 Password: Demo@123
```

## User Details

- **Name:** Demo User
- **Phone:** +91 9876543210
- **Email Status:** ✅ Verified (No OTP required)
- **Role:** USER (Customer)

## What This Account Can Do

✅ **Login** - Direct login without email verification  
✅ **Browse Products** - View all product categories and listings  
✅ **Add to Cart** - Add items to shopping cart  
✅ **Manage Cart** - Update quantities, remove items  
✅ **Checkout** - Proceed to checkout with shipping details  
✅ **Payment** - Test Razorpay payment integration  
✅ **Order Placement** - Complete test orders  
✅ **Order History** - View past orders in account section  

## Testing Payment Flow

### Step-by-Step Instructions:

1. **Login**
   - Go to: https://aaavrti.shop/auth/login
   - Email: `demo@aaavrti.com`
   - Password: `Demo@123`

2. **Add Products to Cart**
   - Browse categories (Sarees, Kurtas, Men, Women, etc.)
   - Click "Add to Cart" on any product
   - Select size/variant if required

3. **Proceed to Checkout**
   - Click on Cart icon in header
   - Review cart items
   - Click "Proceed to Checkout"

4. **Enter Shipping Details**
   - Fill in delivery address
   - Add contact information
   - Continue to payment

5. **Test Razorpay Integration**
   - Razorpay payment gateway will be loaded
   - Use test card details provided by Razorpay
   - Complete test transaction

6. **Order Confirmation**
   - View order confirmation page
   - Check order details in "My Orders" section

## Razorpay Test Cards

For testing purposes, you can use these Razorpay test card details:

### Successful Payment
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

### Failed Payment
```
Card Number: 4111 1111 1111 1234
CVV: Any 3 digits
Expiry: Any future date
```

### UPI Testing
```
UPI ID: success@razorpay
```

## API Integration Details

- **Payment Gateway:** Razorpay
- **Currency:** INR (₹)
- **Environment:** Production/Test mode (check .env settings)
- **Webhook URL:** https://aaavrti.shop/api/webhooks/razorpay

## Notes for Razorpay Team

- This is a **verified demo account** - no email verification required
- Account is pre-configured for immediate testing
- All features are fully functional
- Cart and order history will persist across sessions
- Feel free to place multiple test orders

## Support

If you encounter any issues during testing, please contact:
- **Developer:** Kamlesh Singh
- **Project:** Ournika E-commerce Platform

---

**Last Updated:** January 3, 2026  
**Account Created:** Via seed script  
**Status:** ✅ Active & Verified
