// Test WhatsApp notification
// Run with: node test-whatsapp.js

require('dotenv').config();

async function testWhatsApp() {
    const twilio = require('twilio');

    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    try {
        console.log('Sending test WhatsApp message...');

        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+917461913495',
            body: '🎉 Success! Your Aaavrti WhatsApp integration is working!\n\nYou will now receive:\n✅ Order confirmations\n✅ Shipping updates\n✅ OTP codes\n\nAll via WhatsApp + Email!'
        });

        console.log('✅ Message sent successfully!');
        console.log('Message SID:', message.sid);
        console.log('Status:', message.status);
        console.log('\nCheck your WhatsApp now! 📱');
    } catch (error) {
        console.error('❌ Error sending message:', error.message);
    }
}

testWhatsApp();
