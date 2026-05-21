import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const resend  = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') return Response.json({ received: true })

  const session   = event.data.object
  const { data: lineItems } = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] })
  const customer  = session.customer_details
  const shipping  = session.shipping_details
  const orderId   = session.id.slice(-8).toUpperCase()
  const orderDate = new Date().toLocaleDateString('en-US', { dateStyle: 'long' })

  const itemsHtml = lineItems.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a18;font-size:14px;color:#c8c5bc">
        ${item.price.product.name}<br>
        <span style="font-size:12px;color:#6a6860">${item.price.product.description}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #1a1a18;text-align:right;font-size:14px;color:#b8954a">
        $${(item.amount_total / 100).toFixed(2)}
      </td>
    </tr>`).join('')

  const shippingHtml = `${customer.name}<br>${shipping.address.line1}<br>${shipping.address.line2 ? shipping.address.line2 + '<br>' : ''}${shipping.address.city}, ${shipping.address.state ?? ''} ${shipping.address.postal_code}<br>${shipping.address.country}`

  await resend.emails.send({
    from: `Studio Editions Orders <${process.env.YOUR_FROM_EMAIL}>`,
    to: process.env.PRINT_HOUSE_EMAIL,
    replyTo: process.env.YOUR_REPLY_EMAIL,
    subject: `🖨 New print order #${orderId} — please fulfill`,
    html: `<div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;background:#0a0a08;color:#c8c5bc;padding:40px 32px">
      <p style="font-family:Georgia,serif;font-size:20px;color:#f5f2ec;margin:0 0 32px">Studio Editions — Order #${orderId}</p>
      <p style="font-size:12px;color:#6a6860;margin:0 0 8px">${orderDate}</p>
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:16px 0 8px">Items to print</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:32px">${itemsHtml}</table>
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 8px">Ship to</p>
      <p style="font-size:14px;line-height:1.8;color:#c8c5bc;margin-bottom:32px">${shippingHtml}</p>
      <div style="border-top:1px solid #1a1a18;padding-top:20px;font-size:12px;color:#6a6860;line-height:1.8">Please reply to confirm receipt. Standard: 10 business days · Express: 5 business days.</div>
    </div>`,
  })

  await resend.emails.send({
    from: `Studio Editions <${process.env.YOUR_FROM_EMAIL}>`,
    to: customer.email,
    replyTo: process.env.YOUR_REPLY_EMAIL,
    subject: `Your order is confirmed — #${orderId}`,
    html: `<div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;background:#0a0a08;color:#c8c5bc;padding:40px 32px">
      <p style="font-family:Georgia,serif;font-size:20px;color:#f5f2ec;margin:0 0 32px;padding-bottom:24px;border-bottom:1px solid #1a1a18">Studio Editions</p>
      <p style="font-size:22px;font-family:Georgia,serif;color:#f5f2ec;margin:0 0 12px">Thank you, ${customer.name.split(' ')[0]}.</p>
      <p style="font-size:14px;color:#6a6860;line-height:1.9;margin-bottom:32px">Your order has been received and sent to our print studio. Each print is produced by hand on archival materials and signed before shipping.</p>
      <div style="background:#111110;padding:20px 24px;margin-bottom:28px">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#6a6860;margin:0 0 12px">Order #${orderId}</p>
        <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>
      </div>
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#6a6860;margin:0 0 8px">Shipping to</p>
      <p style="font-size:14px;color:#c8c5bc;line-height:1.8;margin-bottom:28px">${shippingHtml}</p>
      <p style="font-size:14px;color:#6a6860;line-height:1.8;">Estimated delivery: <span style="color:#c8c5bc">7–10 business days</span><br>You'll receive tracking once your print leaves the studio.</p>
      <div style="border-top:1px solid #1a1a18;margin-top:40px;padding-top:20px;font-size:12px;color:#6a6860;">Questions? Reply to this email. · Studio Editions</div>
    </div>`,
  })

  return Response.json({ received: true })
}
