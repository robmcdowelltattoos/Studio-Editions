# Deploy guide — Studio Editions
Plain English. No experience required. ~30 minutes start to finish.

---

## What you need to set up (all free)
- GitHub account — github.com
- Vercel account — vercel.com (sign up with GitHub)
- Stripe account — stripe.com
- Resend account — resend.com

---

## Step 1 — Put the code on GitHub (5 min)

1. Go to github.com → click the **+** button → **New repository**
2. Name it `studio-editions`, leave everything else as default → **Create repository**
3. GitHub will show you a page with instructions. Follow the "push an existing repository" option:

```bash
# In your terminal, navigate to the studio-editions folder, then:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/studio-editions.git
git push -u origin main
```

Your code is now on GitHub.

---

## Step 2 — Get your Stripe keys (5 min)

1. Go to **dashboard.stripe.com** → sign in
2. In the left sidebar, click **Developers** → **API keys**
3. Copy these two values — you'll need them shortly:
   - **Publishable key** — starts with `pk_live_...`
   - **Secret key** — starts with `sk_live_...` (click Reveal)

> During testing, use the **test** keys instead (`pk_test_...` and `sk_test_...`)
> so you can place orders without real money. Switch to live keys when ready to launch.

---

## Step 3 — Set up Resend for emails (5 min)

1. Go to **resend.com** → create account
2. Click **API Keys** → **Create API Key** → name it "studio-editions" → copy the key
3. Go to **Domains** → **Add Domain** → follow the instructions to verify your domain
   (this makes emails come from your domain and not land in spam)
4. Note your verified `from` email address — e.g. `orders@yourdomain.com`

---

## Step 4 — Deploy to Vercel (10 min)

1. Go to **vercel.com** → **Add New Project**
2. Click **Import** next to your `studio-editions` GitHub repo
3. Vercel will detect it's a Next.js project automatically
4. Before clicking Deploy, click **Environment Variables** and add these one by one:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (from Step 2) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (from Step 2) |
| `RESEND_API_KEY` | `re_...` (from Step 3) |
| `PRINT_HOUSE_EMAIL` | your printer's email address |
| `YOUR_FROM_EMAIL` | `orders@yourdomain.com` |
| `YOUR_REPLY_EMAIL` | `hello@yourdomain.com` |
| `NEXT_PUBLIC_BASE_URL` | leave blank for now — add after deploy |
| `STRIPE_WEBHOOK_SECRET` | leave blank for now — add in Step 5 |

5. Click **Deploy** — Vercel builds and deploys automatically (~2 min)
6. Once deployed, copy your Vercel URL (e.g. `https://studio-editions.vercel.app`)
7. Go back to Environment Variables → edit `NEXT_PUBLIC_BASE_URL` → paste your URL → **Save**
8. Go to **Deployments** → click the three dots on your deployment → **Redeploy**

---

## Step 5 — Register the Stripe webhook (5 min)

This is what tells Stripe to notify your site after a payment succeeds.

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-vercel-url.vercel.app/api/webhook`
3. Click **Select events** → find and check `checkout.session.completed` → **Add events**
4. Click **Add endpoint**
5. On the webhook page, click **Reveal** next to **Signing secret**
6. Copy the `whsec_...` value
7. Go back to Vercel → Environment Variables → edit `STRIPE_WEBHOOK_SECRET` → paste → **Save**
8. Redeploy once more

---

## Step 6 — Test with a real order (5 min)

Before going live:

1. Make sure you're using Stripe **test keys** (not live keys yet)
2. Visit your Vercel URL
3. Click a print → add to cart → checkout
4. Use Stripe's test card: **4242 4242 4242 4242** · any future expiry · any CVC
5. Complete the order
6. Check that you received the print house email
7. Check that the customer confirmation email arrived

If both emails arrive and the success page shows — you're good to go.

---

## Step 7 — Add your domain (optional)

1. Vercel → your project → **Settings** → **Domains** → type your domain → **Add**
2. Follow Vercel's DNS instructions (they vary by registrar)
3. Once DNS propagates, update `NEXT_PUBLIC_BASE_URL` to your real domain and redeploy

---

## Step 8 — Switch to live Stripe keys

When you're ready to take real payments:

1. Stripe Dashboard → Developers → API keys → copy the **live** keys
2. Vercel → Environment Variables → update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Add a new webhook endpoint using your live domain (repeat Step 5)
4. Update `STRIPE_WEBHOOK_SECRET` with the new live webhook secret
5. Redeploy

You're live. 🎉

---

## Adding a new painting later

1. Add the image to `public/prints/yourpainting.jpg`
2. Open `lib/products.js` and add a new entry following the same pattern as `gold` or `dragon`
3. Push to GitHub — Vercel redeploys automatically

---

## Troubleshooting

**Emails not arriving**
- Check Resend dashboard for errors
- Make sure your domain is verified in Resend
- Check spam folders

**Webhook not firing**
- In Stripe Dashboard → Webhooks → click your endpoint → check the logs tab
- Make sure `STRIPE_WEBHOOK_SECRET` matches the one on the webhook page

**Site not updating after changes**
- Vercel auto-deploys on every git push to `main`
- Check the Deployments tab in Vercel for build errors
