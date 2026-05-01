'use client'
// app/page.js

import { useState } from 'react'
import Image from 'next/image'
import { PRODUCTS } from '../lib/products'

export default function Home() {
  const [currentProduct, setCurrentProduct] = useState(null)
  const [cart, setCart]                     = useState([])
  const [selectedSize, setSelectedSize]     = useState(null)
  const [toastMsg, setToastMsg]             = useState('')
  const [toastVisible, setToastVisible]     = useState(false)
  const [checkingOut, setCheckingOut]       = useState(false)

  const products = Object.values(PRODUCTS)

  function showToast(msg) {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2400)
  }

  function openProduct(key) {
    const p = PRODUCTS[key]
    setCurrentProduct(p)
    setSelectedSize(p.sizes[0])
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function closeProduct() {
    setCurrentProduct(null)
    setSelectedSize(null)
  }

  function addToCart() {
    if (!selectedSize) return
    const item = {
      paintingKey: currentProduct.key,
      sizeKey: selectedSize.key,
      label: `${currentProduct.title} — ${selectedSize.label}`,
      cents: selectedSize.cents,
      quantity: 1,
    }
    // Replace any existing item for this painting
    setCart(prev => [...prev.filter(i => i.paintingKey !== item.paintingKey), item])
    showToast('Added to cart')
  }

  async function checkout() {
    if (cart.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      showToast('Something went wrong — please try again')
      setCheckingOut(false)
    }
  }

  const cartCount = cart.length

  return (
    <>
      {/* ── NAV ── */}
      <nav>
        <div className="wordmark" onClick={closeProduct} style={{ cursor: 'pointer' }}>
          Studio<span> ·</span> Editions
        </div>
        <div className="nav-links">
          <a onClick={closeProduct}>Prints</a>
          <a>About</a>
          <a>Process</a>
        </div>
        <button className="nav-cart" onClick={checkout} disabled={cartCount === 0 || checkingOut}>
          {checkingOut ? 'Redirecting…' : `Cart (${cartCount})`}
        </button>
      </nav>

      {/* ── HOME ── */}
      {!currentProduct && (
        <>
          {/* Hero */}
          <div className="hero">
            <div
              className="hero-bg"
              style={{ backgroundImage: `url('/prints/gold.jpg')` }}
            />
            <div className="hero-gradient" />
            <div className="hero-content">
              <div className="hero-eyebrow">Fine art · Printed to order · Limited editions</div>
              <div className="hero-title">
                Paintings<br />in <em>gold</em><br />&amp; shadow
              </div>
              <p className="hero-sub">
                Archival giclée prints produced by hand at a specialist studio.
                Each piece ships on cotton rag paper within 7–10 days.
              </p>
              <button
                className="hero-cta"
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View all prints →
              </button>
            </div>
            <div className="scroll-hint">
              <div className="scroll-line" />
              Scroll
            </div>
          </div>

          {/* Gallery */}
          <section className="gallery-section" id="gallery">
            <div className="section-header">
              <div className="section-title">Available prints</div>
              <div className="section-count">{products.length} works</div>
            </div>
            <div className="gallery-grid">
              {products.map(p => (
                <div
                  key={p.key}
                  className={`gallery-item gallery-item-${p.aspectRatio === '3/4' ? 'portrait' : 'landscape'}`}
                  onClick={() => openProduct(p.key)}
                >
                  <img src={p.image} alt={p.title} />
                  <div className="gallery-overlay" />
                  <div className="gallery-meta">
                    <div className="gallery-item-name">{p.title}</div>
                    <div className="gallery-item-info">
                      <span>{p.edition} · {p.medium}</span>
                      <span className="gallery-item-price">
                        From ${(p.sizes[0].cents / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer>
            <div>© Studio Editions</div>
            <div>Original paintings · Limited print runs · Archival materials</div>
          </footer>
        </>
      )}

      {/* ── PRODUCT PAGE ── */}
      {currentProduct && (
        <div className="product-page">
          {/* Image panel */}
          <div className="product-image-panel">
            <img src={currentProduct.image} alt={currentProduct.title} />
          </div>

          {/* Detail panel */}
          <div className="product-detail-panel">
            <button className="product-back" onClick={closeProduct}>
              ← All prints
            </button>

            <div className="product-title">{currentProduct.title}</div>
            <div className="product-edition">{currentProduct.edition} · {currentProduct.medium}</div>

            <div className="product-price">
              From <strong>${(selectedSize?.cents / 100).toFixed(0)}</strong>
            </div>

            <p className="product-desc">{currentProduct.description}</p>

            <div className="option-label">Select size</div>
            <div className="size-grid">
              {currentProduct.sizes.map(s => (
                <button
                  key={s.key}
                  className={`size-btn${selectedSize?.key === s.key ? ' active' : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s.label} · ${(s.cents / 100).toFixed(0)}
                </button>
              ))}
            </div>

            <button className="add-btn" onClick={addToCart}>
              Add to cart
            </button>

            {cartCount > 0 && (
              <button
                className="checkout-btn"
                onClick={checkout}
                disabled={checkingOut}
              >
                {checkingOut ? 'Redirecting to payment…' : `Checkout (${cartCount} item${cartCount > 1 ? 's' : ''})`}
              </button>
            )}

            {/* Specs */}
            <div className="product-specs">
              {[
                ['Paper',         currentProduct.paper],
                ['Original size', currentProduct.originalSize],
                ['Edition',       currentProduct.edition],
                ['Ships',         '7–10 business days'],
                ['Includes',      'Certificate of authenticity'],
              ].map(([label, val]) => (
                <div className="spec-row" key={label}>
                  <span className="spec-label">{label}</span>
                  <span className="spec-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>
    </>
  )
}
