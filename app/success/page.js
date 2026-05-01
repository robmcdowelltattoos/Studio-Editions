// app/success/page.js
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-mark">✓</div>
        <div className="success-title">Order confirmed</div>
        <p className="success-sub">
          Thank you for your order. Your print will be produced by hand at our studio
          and shipped on archival cotton rag paper within 7–10 business days.
          A confirmation has been sent to your email.
        </p>
        <Link href="/" className="success-link">
          Return to store →
        </Link>
      </div>
    </div>
  )
}
