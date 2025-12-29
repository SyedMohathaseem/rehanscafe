const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

admin.initializeApp();
const db = admin.firestore();

// Configure nodemailer with Gmail SMTP
// IMPORTANT: Set these in Firebase environment config:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_EMAIL,
    pass: functions.config().gmail?.password || process.env.GMAIL_PASSWORD
  }
});

/**
 * Generates a PDF invoice in memory and returns it as a Buffer
 */
function generateInvoicePDF(order, user, orderId) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Header
      doc.fontSize(24).font("Helvetica-Bold").text("REHAN'S Multi Cuisine Restaurants", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).font("Helvetica").text("Order Invoice", { align: "center" });
      doc.moveDown(1);

      // Horizontal line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Order details
      doc.fontSize(12).font("Helvetica-Bold").text("Order ID: ", { continued: true });
      doc.font("Helvetica").text(orderId);
      
      doc.font("Helvetica-Bold").text("Customer Name: ", { continued: true });
      doc.font("Helvetica").text(user.name || "Valued Customer");
      
      doc.font("Helvetica-Bold").text("Email: ", { continued: true });
      doc.font("Helvetica").text(user.email);
      
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
      doc.font("Helvetica-Bold").text("Order Date: ", { continued: true });
      doc.font("Helvetica").text(orderDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
      
      doc.moveDown(1);

      // Items table header
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.font("Helvetica-Bold");
      doc.text("Item", 50, doc.y, { width: 250 });
      doc.text("Qty", 300, doc.y - 14, { width: 50, align: "center" });
      doc.text("Price", 350, doc.y - 14, { width: 100, align: "right" });
      doc.text("Total", 450, doc.y - 14, { width: 100, align: "right" });
      
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      doc.font("Helvetica");
      let subtotal = 0;
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const itemName = item.name || "Item";
          const qty = item.qty || item.quantity || 1;
          const price = parseFloat(item.price) || 0;
          const itemTotal = qty * price;
          subtotal += itemTotal;

          const yPos = doc.y;
          doc.text(itemName, 50, yPos, { width: 250 });
          doc.text(qty.toString(), 300, yPos, { width: 50, align: "center" });
          doc.text(`₹${price.toLocaleString("en-IN")}`, 350, yPos, { width: 100, align: "right" });
          doc.text(`₹${itemTotal.toLocaleString("en-IN")}`, 450, yPos, { width: 100, align: "right" });
          doc.moveDown(0.5);
        });
      }

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Total
      const totalAmount = order.totalAmount || subtotal;
      doc.font("Helvetica-Bold").fontSize(14);
      doc.text("Total Amount:", 350, doc.y, { width: 100, align: "right" });
      doc.text(`₹${totalAmount.toLocaleString("en-IN")}`, 450, doc.y - 14, { width: 100, align: "right" });

      doc.moveDown(2);

      // Footer
      doc.fontSize(10).font("Helvetica").fillColor("gray");
      doc.text("Thank you for ordering from REHAN'S Multi Cuisine Restaurants!", { align: "center" });
      doc.text("For any queries, please contact us.", { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Cloud Function triggered on new order creation
 */
exports.sendOrderConfirmationEmail = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    const orderId = context.params.orderId;
    const order = snapshot.data();

    // Validate order data
    if (!order || !order.userId) {
      console.error("Order missing userId:", orderId);
      return null;
    }

    try {
      // Fetch user document
      const userDoc = await db.collection("user").doc(order.userId).get();
      
      if (!userDoc.exists) {
        console.error("User not found for userId:", order.userId);
        return null;
      }

      const user = userDoc.data();

      // Validate email
      if (!user.email) {
        console.error("User has no email:", order.userId);
        return null;
      }

      // Generate PDF invoice
      const pdfBuffer = await generateInvoicePDF(order, user, orderId);

      // Prepare email content
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
      const itemsList = order.items?.map(i => `${i.name} x${i.qty || i.quantity || 1}`).join(", ") || "Items";
      
      const mailOptions = {
        from: `"REHAN'S Multi Cuisine Restaurants" <${functions.config().gmail?.email || process.env.GMAIL_EMAIL}>`,
        to: user.email,
        subject: `Order Confirmation - ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #d4af37; padding: 20px; text-align: center;">
              <h1 style="color: #000; margin: 0;">REHAN'S Multi Cuisine Restaurants</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Thank you for your order, ${user.name || "Valued Customer"}!</h2>
              <p style="color: #666;">Your order has been received and is being prepared.</p>
              
              <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${orderDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                <p><strong>Items:</strong> ${itemsList}</p>
                <p><strong>Total Amount:</strong> ₹${(order.totalAmount || 0).toLocaleString("en-IN")}</p>
              </div>
              
              <p style="color: #666;">Please find your invoice attached to this email.</p>
              <p style="color: #666;">If you have any questions, feel free to contact us.</p>
            </div>
            <div style="background: #333; padding: 15px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2026 REHAN'S Multi Cuisine Restaurants. All Rights Reserved.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `Invoice-${orderId}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent to:", user.email);

      // Mark order as email sent (optional)
      await snapshot.ref.update({ emailSent: true, emailSentAt: admin.firestore.FieldValue.serverTimestamp() });

      return null;
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return null;
    }
  });
