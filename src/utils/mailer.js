const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Gmail App Password (not your login password)
    }
});

/**
 * Send a verification email with a styled HTML template
 * @param {string} to  - recipient email
 * @param {string} name - recipient full name
 * @param {string} token - unique verification token
 */
async function sendVerificationEmail(to, name, token) {
    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3002'}/verify-email.html?token=${token}`;
    const firstName = name.split(' ')[0];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b9d 0%,#c44dff 100%);padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🛍️ Happy Shopping</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Verify your email address</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:22px;font-weight:600;">
                Hi ${firstName}! 👋
              </h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                Thanks for creating an account on <strong>Happy Shopping</strong>. You're almost ready to start exploring thousands of products!
              </p>
              <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
                Just click the button below to verify your email address. This link will expire in <strong>24 hours</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#ff6b9d,#c44dff);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 48px;border-radius:50px;letter-spacing:0.3px;">
                      ✅ Verify My Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;color:#888;font-size:13px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#c44dff;word-break:break-all;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9fc;padding:24px 48px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;line-height:1.6;">
                If you didn't create an account with Happy Shopping, you can safely ignore this email.<br/>
                © ${new Date().getFullYear()} Happy Shopping. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await transporter.sendMail({
        from: `"Happy Shopping 🛍️" <${process.env.EMAIL_USER}>`,
        to,
        subject: '✅ Verify your Happy Shopping account',
        html
    });
}

/**
 * Send a resend verification email (same template, just a new token)
 */
async function resendVerificationEmail(to, name, token) {
    return sendVerificationEmail(to, name, token);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
    return `Rs. ${Number(value || 0).toFixed(2)}`;
}

/**
 * Send an order confirmation email with bill details.
 * @param {string} to - recipient email
 * @param {object} order - order summary and items
 */
async function sendOrderConfirmationEmail(to, order) {
    const name = order.full_name || 'Customer';
    const firstName = String(name).split(' ')[0] || 'there';
    const items = Array.isArray(order.items) ? order.items : [];
    const orderDate = order.order_date ? new Date(order.order_date) : new Date();

    const itemRows = items.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eef0f5;color:#1a1a2e;">
          ${escapeHtml(item.product_name || 'Product')}
        </td>
        <td align="center" style="padding:12px;border-bottom:1px solid #eef0f5;color:#555;">
          ${escapeHtml(item.quantity || 0)}
        </td>
        <td align="right" style="padding:12px;border-bottom:1px solid #eef0f5;color:#555;">
          ${formatCurrency(item.price)}
        </td>
        <td align="right" style="padding:12px;border-bottom:1px solid #eef0f5;color:#1a1a2e;font-weight:700;">
          ${formatCurrency(item.line_total)}
        </td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Placed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b9d 0%,#22d3ee 100%);padding:36px 44px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Happy Shopping</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Your order has been placed</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 44px;">
              <h2 style="margin:0 0 14px;color:#1a1a2e;font-size:22px;">Hi ${escapeHtml(firstName)}, your order is placed.</h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                Thanks for shopping with us. Your bill details are below.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9fc;border:1px solid #eef0f5;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;color:#555;font-size:14px;">Order ID</td>
                  <td align="right" style="padding:16px;color:#1a1a2e;font-weight:700;">#${escapeHtml(order.order_id)}</td>
                </tr>
                <tr>
                  <td style="padding:0 16px 16px;color:#555;font-size:14px;">Order Date</td>
                  <td align="right" style="padding:0 16px 16px;color:#1a1a2e;">${escapeHtml(orderDate.toLocaleString('en-IN'))}</td>
                </tr>
                <tr>
                  <td style="padding:0 16px 16px;color:#555;font-size:14px;">Payment Method</td>
                  <td align="right" style="padding:0 16px 16px;color:#1a1a2e;">${escapeHtml(order.payment_method || 'COD')}</td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <thead>
                  <tr>
                    <th align="left" style="padding:12px;background:#f9f9fc;color:#555;font-size:13px;">Item</th>
                    <th align="center" style="padding:12px;background:#f9f9fc;color:#555;font-size:13px;">Qty</th>
                    <th align="right" style="padding:12px;background:#f9f9fc;color:#555;font-size:13px;">Price</th>
                    <th align="right" style="padding:12px;background:#f9f9fc;color:#555;font-size:13px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="right" style="padding:16px 0;color:#555;font-size:16px;">Grand Total</td>
                  <td align="right" style="padding:16px 0;color:#c026d3;font-size:24px;font-weight:800;width:180px;">
                    ${formatCurrency(order.total_amount)}
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.6;">
                Shipping to:<br/>
                <span style="color:#555;">${escapeHtml(order.shipping_address || '').replace(/\n/g, '<br/>')}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9f9fc;padding:22px 44px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;">Thank you for choosing Happy Shopping.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await transporter.sendMail({
        from: `"Happy Shopping" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Order placed - Bill #${order.order_id}`,
        html
    });
}

module.exports = { sendVerificationEmail, resendVerificationEmail, sendOrderConfirmationEmail };
