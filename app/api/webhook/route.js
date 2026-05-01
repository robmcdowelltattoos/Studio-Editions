// app/api/webhook/route.js
import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend  = new Resend(process.env.RESEND_API_KEY)

// Disable body parsing — Stripe needs the raw body to verify the signature

export async function POST(req) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  // Only handle successful payments
  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object

  // Fetch full line items with product metadata
  const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
    session.id,
    { expand: ['data.price.product'] }
  )

  const customer = session.customer_details
  const shipping = session.shipping_details
  const orderId  = session.id.slice(-8).toUpperCase()
  const orderDate = new Date().toLocaleDateString('en-US', { dateStyle: 'long' })

  // ─── Build shared HTML for order items ────────────────────────────
  const itemsHtml = lineItems.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a18;font-size:14px;color:#c8c5bc">
        ${item.price.product.name}<br>
        <span style="font-size:12px;color:#6a6860">${item.price.product.description}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a18;text-align:right;font-size:14px;color:#b8954a">
        $${(item.amount_total / 100).toFixed(2)}
      </td>
    </tr>`
  ).join('')

  const shippingHtml = `
    ${customer.name}<br>
    ${shipping.address.line1}<br>
    ${shipping.address.line2 ? shipping.address.line2 + '<br>' : ''}
    ${shipping.address.city}, ${shipping.address.state ?? ''} ${shipping.address.postal_code}<br>
    ${shipping.address.country}
  `

  // ─── Email 1: Print house ──────────────────────────────────────────
  await resend.emails.send({
    from:    `Studio Editions Orders <${process.env.YOUR_FROM_EMAIL}>`,
    to:      process.env.PRINT_HOUSE_EMAIL,
    replyTo: process.env.YOUR_REPLY_EMAIL,
    subject: `🖨 New print order #${orderId} — please fulfill`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;background:#0a0a08;color:#c8c5bc;padding:40px 32px">

        <p style="font-family:Georgia,serif;font-size:20px;color:#f5f2ec;margin:0 0 4px">Studio Editions</p>
        <p style="font-size:12px;color:#6a6860;margin:0 0 32px;letter-spacing:.12em;text-transform:uppercase">Order notification</p>

        <div style="background:#111110;padding:20px 24px;margin-bottom:28px">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 4px">Order</p>
          <p style="font-size:22px;font-family:Georgia,serif;color:#f5f2ec;margin:0">#${orderId}</p>
          <p style="font-size:12px;color:#6a6860;margin:4px 0 0">${orderDate}</p>
        </div>

        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 8px">Items to print</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:32px">${itemsHtml}</table>

        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 8px">Ship to</p>
        <p style="font-size:14px;line-height:1.8;color:#c8c5bc;margin-bottom:32px">${shippingHtml}</p>

        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 8px">Print files</p>
        <p style="font-size:14px;color:#c8c5bc;margin-bottom:32px;line-height:1.7">
          Please use the high-resolution files from our shared folder.<br>
          <a href="https://REPLACE_WITH_YOUR_FILE_SHARE_LINK" style="color:#b8954a">Access print files →</a>
        </p>

        <div style="border-top:1px solid #1a1a18;padding-top:20px;font-size:12px;color:#6a6860;line-height:1.8">
          Please reply to confirm you've received this order.<br>
          Standard: deliver within 10 business days · Express: 5 business days.<br>
          Ship to customer address above — do not include invoice.
        </div>

      </div>`,
  })

  // ─── Email 2: Customer confirmation ───────────────────────────────
  await resend.emails.send({
    from:    `Studio Editions <${process.env.YOUR_FROM_EMAIL}>`,
    to:      customer.email,
    replyTo: process.env.YOUR_REPLY_EMAIL,
    subject: `Your order is confirmed — #${orderId}`,
    html: `
      <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;background:#0a0a08;color:#c8c5bc;padding:40px 32px">

        <p style="font-family:Georgia,serif;font-size:20px;color:#f5f2ec;margin:0 0 32px;padding-bottom:24px;border-bottom:1px solid #1a1a18">
          Studio Editions
        </p>

        <p style="font-size:22px;font-family:Georgia,serif;color:#f5f2ec;margin:0 0 12px">
          Thank you, ${customer.name.split(' ')[0]}.
        </p>
        <p style="font-size:14px;color:#6a6860;line-height:1.9;margin-bottom:32px">
          Your order has been received and will be sent to our print studio shortly.
          Each print is produced by hand on archival cotton rag paper and signed before shipping.
        </p>

        <div style="background:#111110;padding:20px 24px;margin-bottom:28px">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#6a6860;margin:0 0 12px">Order #${orderId}</p>
          <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
          <div style="border-top:1px solid #1a1a18;margin-top:4px;padding-top:12px;display:flex;justify-content:space-between">
            <span style="font-size:12px;color:#6a6860">Total</span>
            <span style="font-size:14px;color:#b8954a">$${(session.amount_total / 100).toFixed(2)}</span>
          </div>
        </div>

        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 8px">Shipping to</p>
        <p style="font-size:14px;color:#c8c5bc;line-height:1.8;margin-bottom:28px">${shippingHtml}</p>

        <p style="font-size:14px;color:#6a6860;line-height:1.8;margin-bottom:40px">
          Estimated delivery: <span style="color:#c8c5bc">7–10 business days</span><br>
          You'll receive a shipping confirmation with tracking once your print leaves the studio.
        </p>

        <div style="border-top:1px solid #1a1a18;padding-top:20px;font-size:12px;color:#6a6860;line-height:1.8">
          Questions? Reply to this email — we'll get back to you within one business day.<br>
          Studio Editions · Fine art prints · Limited editions
        </div>

      </div>`,
  })

  console.log(`Order #${orderId} processed — emails sent to ${customer.email} and print house.`)
  return Response.json({ received: true })
}
