// app/api/checkout/route.js
import Stripe from 'stripe'
import { PRICE_MAP, PRODUCTS } from '../../../lib/products'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const lineItems = items.map(item => {
      const priceKey   = `${item.paintingKey}-${item.sizeKey}`
      const unitAmount = PRICE_MAP[priceKey]

      if (!unitAmount) {
        throw new Error(`Unknown product: ${priceKey}`)
      }

      const product  = PRODUCTS[item.paintingKey]
      const sizeInfo = product.sizes.find(s => s.key === item.sizeKey)

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.title} — Fine Art Print`,
            description: `${sizeInfo.label} · ${product.medium} · ${product.paper}`,
            images: [`${process.env.NEXT_PUBLIC_BASE_URL}${product.image}`],
            metadata: {
              paintingKey: item.paintingKey,
              sizeKey:     item.sizeKey,
              sizeLabel:   sizeInfo.label,
            },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity ?? 1,
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',

      // Collect shipping address from customer
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'IT', 'ES'],
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' },
            display_name: 'Standard shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 7 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 3500, currency: 'usd' },
            display_name: 'Express shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],

      // Where to send the customer after checkout
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    })

    return Response.json({ url: session.url })

  } catch (err) {
    console.error('Checkout error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
