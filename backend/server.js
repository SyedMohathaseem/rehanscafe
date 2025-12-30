const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3001;

// Startup validation for environment variables
console.log('=== Server Starting ===');
console.log('Checking environment variables...');

if (!process.env.RESEND_API_KEY) {
    console.error('⚠️  WARNING: RESEND_API_KEY environment variable is NOT set!');
} else {
    console.log('✓ RESEND_API_KEY is set:', process.env.RESEND_API_KEY.substring(0, 8) + '***');
}

if (!process.env.FROM_EMAIL) {
    console.log('ℹ️  FROM_EMAIL not set, will use default Resend email');
}

app.use(cors());
app.use(express.json());

// Root route for quick health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: "REHAN'S Invoice Server",
        emailConfigured: !!process.env.RESEND_API_KEY,
        emailProvider: 'Resend',
        timestamp: new Date().toISOString() 
    });
});

function generateInvoicePDF(orderData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fontSize(24).font('Helvetica-Bold').text("REHAN'S Multi Cuisine Restaurants", { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).font('Helvetica').text('Order Invoice', { align: 'center' });
            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(1);

            doc.fontSize(12).font('Helvetica-Bold').text('Order ID: ', { continued: true });
            doc.font('Helvetica').text(orderData.orderId);
            doc.font('Helvetica-Bold').text('Customer: ', { continued: true });
            doc.font('Helvetica').text(orderData.name);
            doc.font('Helvetica-Bold').text('Email: ', { continued: true });
            doc.font('Helvetica').text(orderData.email);
            doc.font('Helvetica-Bold').text('Date: ', { continued: true });
            doc.font('Helvetica').text(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
            doc.moveDown(1);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold');
            const headerY = doc.y;
            doc.text('Item', 50, headerY, { width: 250 });
            doc.text('Qty', 300, headerY, { width: 50, align: 'center' });
            doc.text('Price', 350, headerY, { width: 100, align: 'right' });
            doc.text('Total', 450, headerY, { width: 100, align: 'right' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica');
            if (orderData.items && Array.isArray(orderData.items)) {
                orderData.items.forEach(item => {
                    const qty = item.qty || item.quantity || 1;
                    const price = parseFloat(item.price) || 0;
                    const itemTotal = qty * price;
                    const yPos = doc.y;
                    doc.text(item.name || 'Item', 50, yPos, { width: 250 });
                    doc.text(qty.toString(), 300, yPos, { width: 50, align: 'center' });
                    doc.text('Rs.' + price.toLocaleString('en-IN'), 350, yPos, { width: 100, align: 'right' });
                    doc.text('Rs.' + itemTotal.toLocaleString('en-IN'), 450, yPos, { width: 100, align: 'right' });
                    doc.moveDown(0.5);
                });
            }

            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('Total Amount:', 350, doc.y, { width: 100, align: 'right' });
            doc.text('Rs.' + (orderData.totalAmount || 0).toLocaleString('en-IN'), 450, doc.y - 14, { width: 100, align: 'right' });
            doc.moveDown(2);
            doc.fontSize(10).font('Helvetica').fillColor('gray');
            doc.text("Thank you for ordering from REHAN'S Multi Cuisine Restaurants!", { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// Send email using Resend API (HTTP-based, works on Render)
async function sendEmailWithResend(to, subject, htmlContent, pdfAttachment, orderId) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    // Prepare the email payload
    const emailPayload = {
        from: `REHAN'S Multi Cuisine Restaurants <${FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: htmlContent,
        attachments: pdfAttachment ? [{
            filename: `Invoice-${orderId}.pdf`,
            content: pdfAttachment.toString('base64')
        }] : []
    };

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
    });

    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to send email via Resend');
    }
    
    return result;
}

app.post('/send-invoice', async (req, res) => {
    const { email, name, orderId, items, totalAmount } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'Invalid email address' });
    }
    if (!orderId || !items || !totalAmount) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const pdfBuffer = await generateInvoicePDF({ email, name, orderId, items, totalAmount });
        const itemsList = items.map(i => i.name + ' x' + (i.qty || i.quantity || 1)).join(', ');

        const htmlContent = `
            <div style="font-family:Arial;max-width:600px;margin:0 auto">
                <div style="background:#d4af37;padding:20px;text-align:center">
                    <h1 style="color:#000;margin:0">REHAN'S Multi Cuisine Restaurants</h1>
                </div>
                <div style="padding:30px;background:#f9f9f9">
                    <h2>Thank you for your order, ${name || 'Valued Customer'}!</h2>
                    <p>Your order has been received and is being prepared.</p>
                    <div style="background:#fff;padding:20px;border-radius:8px;margin:20px 0">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Items:</strong> ${itemsList}</p>
                        <p><strong>Total:</strong> Rs.${totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <p>Please find your invoice attached.</p>
                </div>
            </div>
        `;

        const result = await sendEmailWithResend(
            email,
            'Order Confirmation - ' + orderId,
            htmlContent,
            pdfBuffer,
            orderId
        );

        console.log('Email sent to:', email, 'Resend ID:', result.id);
        res.json({ success: true, message: 'Invoice sent to ' + email, emailId: result.id });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send email',
            details: error.message || 'Unknown error'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log('Invoice server running on port ' + PORT);
});
