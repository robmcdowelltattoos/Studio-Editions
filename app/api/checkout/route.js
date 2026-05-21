import Stripe from 'stripe'
import { PRICE_MAP, PRODUCTS } from '../../../lib/products'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { items } = await req.json()
    if (!items || items.length === 0) return Response.json({ error: 'Cart is empty' }, { status: 400 })

    const lineItems = items.map(item => {
      const priceKey   = `${item.paintingKey}-${item.sizeKey}-${item.materialKey}`
      const unitAmount = PRICE_MAP[priceKey]
      if (!unitAmount) throw new Error(`Unknown product: ${priceKey}`)

      const product  = PRODUCTS[item.paintingKey]
      const size     = product.sizes.find(s => s.key === item.sizeKey)
      const material = size.materials.find(m => m.key === item.materialKey)

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.title}`,
            description: `${size.label} ${size.dimensions} · ${material.label}`,
            images: [`${process.env.NEXT_PUBLIC_BASE_URL}${product.images[0]}`],
            metadata: { paintingKey: item.paintingKey, sizeKey: item.sizeKey, materialKey: item.materialKey },
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
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'IT', 'ES'],
      },
      shipping_options: [
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 1500, currency: 'usd' }, display_name: 'Standard shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 7 }, maximum: { unit: 'business_day', value: 10 } } } },
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 3500, currency: 'usd' }, display_name: 'Express shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 3 }, maximum: { unit: 'business_day', value: 5 } } } },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
