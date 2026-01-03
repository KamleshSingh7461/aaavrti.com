# Multi-Channel Notification Setup Guide

## Overview
The notification system supports **3 channels** with automatic fallback:
1. **WhatsApp** (optional, via Twilio)
2. **SMS** (optional, via Twilio)  
3. **Email** (required, always sent)

## How It Works

### Priority Order
```
WhatsApp → SMS → Email (guaranteed)
```

- If user has phone number → Tries WhatsApp
- If WhatsApp fails → Tries SMS
- Email is **always sent** regardless

### Users Without Phone Numbers
- Only receive email notifications
- No errors or failures
- Seamless experience

## Setup (Optional)

### 1. WhatsApp via Twilio (Free Tier)

**Sign up**: https://www.twilio.com/try-twilio  
**Free tier**: 1,000 messages/month

**Add to `.env`**:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886  # Sandbox for testing
```

### 2. SMS (Optional Fallback)

**Add to `.env`**:
```bash
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number
```

### 3. WhatsApp Floating Button

**Add to `.env`**:
```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210  # Your business number
```

## Usage Examples

### Send OTP
```typescript
import { sendOTP } from '@/lib/notifications';

await sendOTP(
  '+919876543210',  // phone (optional)
  'user@example.com',  // email (required)
  '123456',  // OTP
  'John Doe'  // name (optional)
);
```

### Send Order Confirmation
```typescript
import { sendOrderConfirmation } from '@/lib/notifications';

await sendOrderConfirmation(order);
// Automatically sends via WhatsApp + Email
```

## Testing

### Without Twilio (Email Only)
- Don't add Twilio credentials
- All notifications go via email
- No errors, works perfectly

### With Twilio (WhatsApp + Email)
1. Add credentials to `.env`
2. Test with Twilio sandbox number
3. Verify WhatsApp messages arrive

## Cost

- **Email**: Free (using AWS SES)
- **WhatsApp**: Free tier (1,000 msgs/month)
- **SMS**: ~$0.0075 per message (optional)

## Production

For production WhatsApp:
1. Apply for WhatsApp Business API
2. Get approved number
3. Update `TWILIO_WHATSAPP_NUMBER`

**Until then**: Email-only works perfectly for all users!
