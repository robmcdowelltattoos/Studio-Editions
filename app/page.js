'use client'
import { useState } from 'react'
import { PRODUCTS } from '../lib/products'

export default function Home() {
  const [currentProduct, setCurrentProduct] = useState(null)
  const [selectedSize, setSelectedSize]     = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [activeImage, setActiveImage]       = useState(0)
  const [cart, setCart]                     = useState([])
  const [toastMsg, setToastMsg]             = useState('')
  const [toastVisible, setToastVisible]     = useState(false)
  const [checkingOut, setCheckingOut]       = useState(false)

  const products = Object.values(PRODUCTS)

  function showToast(msg) {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2600)
  }

  function openProduct(key) {
    const p = PRODUCTS[key]
    setCurrentProduct(p)
    setSelectedSize(p.sizes[0])
    setSelectedMaterial(p.sizes[0].materials[0])
    setActiveImage(0)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function closeProduct() {
    setCurrentProduct(null)
    setSelectedSize(null)
    setSelectedMaterial(null)
    setActiveImage(0)
  }

  function selectSize(size) {
    setSelectedSize(size)
    setSelectedMaterial(size.materials[0])
  }

  function addToCart() {
    if (!selectedSize || !selectedMaterial) return
    const item = {
      paintingKey:  currentProduct.key,
      sizeKey:      selectedSize.key,
      materialKey:  selectedMaterial.key,
      label:        `${currentProduct.title} — ${selectedSize.label} ${selectedSize.dimensions} · ${selectedMaterial.label}`,
      cents:        selectedMaterial.cents,
      quantity:     1,
    }
    setCart(prev => {
      const filtered = prev.filter(i => !(i.paintingKey === item.paintingKey && i.sizeKey === item.sizeKey && i.materialKey === item.materialKey))
      return [...filtered, item]
    })
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
    } catch {
      showToast('Something went wrong — please try again')
      setCheckingOut(false)
    }
  }

  const cartCount = cart.length

  return (
    <>
      <nav>
        <div className="wordmark" onClick={closeProduct}>Studio<span> ·</span> Editions</div>
        <div className="nav-links">
          <a onClick={closeProduct}>Prints</a>
          <a>About</a>
          <a>Process</a>
        </div>
        <button className="nav-cart" onClick={checkout} disabled={cartCount === 0 || checkingOut}>
          {checkingOut ? 'Redirecting…' : `Cart (${cartCount})`}
        </button>
      </nav>

      {/* HOME */}
      {!currentProduct && (
        <>
          <div className="hero">
            <div className="hero-bg" style={{ backgroundImage: `url('/prints/gold.jpg')` }} />
            <div className="hero-gradient" />
            <div className="hero-content">
              <div className="hero-eyebrow">Fine art · Printed to order · Limited editions</div>
              <div className="hero-title">Paintings<br />in <em>gold</em><br />&amp; shadow</div>
              <p className="hero-sub">Archival giclée prints produced by hand at a specialist studio. Each piece ships on cotton rag paper within 7–10 days.</p>
              <button className="hero-cta" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>
                View all prints →
              </button>
            </div>
            <div className="scroll-hint"><div className="scroll-line" />Scroll</div>
          </div>

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
                  <img src={p.images[0]} alt={p.title} />
                  <div className="gallery-overlay" />
                  <div className="gallery-meta">
                    <div className="gallery-item-name">{p.title}</div>
                    <div className="gallery-item-info">
                      <span>{p.edition} · {p.medium}</span>
                      <span className="gallery-item-price">
                        From ${(p.sizes[0].materials[0].cents / 100).toFixed(0)}
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

      {/* PRODUCT PAGE */}
      {currentProduct && (
        <div className="product-page">
          {/* Image panel with gallery */}
          <div className="product-image-panel">
            <div className="product-image-main">
              <img
                src={currentProduct.images[activeImage]}
                alt={currentProduct.title}
                key={activeImage}
              />
            </div>
            {currentProduct.images.length > 1 && (
              <div className="product-image-thumbs">
                {currentProduct.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`View ${i + 1}`}
                    className={`product-image-thumb${activeImage === i ? ' active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="product-detail-panel">
            <button className="product-back" onClick={closeProduct}>← All prints</button>

            <div className="product-title">{currentProduct.title}</div>
            <div className="product-edition">{currentProduct.edition} · {currentProduct.medium}</div>

            <div className="product-price">
              {selectedMaterial
                ? <><strong>${(selectedMaterial.cents / 100).toFixed(0)}</strong></>
                : <>From <strong>${(currentProduct.sizes[0].materials[0].cents / 100).toFixed(0)}</strong></>
              }
            </div>

            <p className="product-desc">{currentProduct.description}</p>

            {/* Size selector */}
            <div className="option-label">Select size</div>
            <div className="size-grid">
              {currentProduct.sizes.map(s => (
                <button
                  key={s.key}
                  className={`size-btn${selectedSize?.key === s.key ? ' active' : ''}`}
                  onClick={() => selectSize(s)}
                >
                  <span className="size-btn-label">{s.label}</span>
                  <span className="size-btn-dims">{s.dimensions}</span>
                </button>
              ))}
            </div>

            {/* Material selector */}
            {selectedSize && (
              <>
                <div className="option-label">Select finish</div>
                <div className="material-grid">
                  {selectedSize.materials.map(m => (
                    <button
                      key={m.key}
                      className={`material-btn${selectedMaterial?.key === m.key ? ' active' : ''}`}
                      onClick={() => setSelectedMaterial(m)}
                    >
                      <span>{m.label}</span>
                      <span className="material-btn-price">${(m.cents / 100).toFixed(0)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Shipping warning */}
            {selectedMaterial?.warning && (
              <div className="shipping-warning">
                <strong>⚠ Shipping note</strong>
                {selectedMaterial.warning}
              </div>
            )}

            <button className="add-btn" onClick={addToCart} disabled={!selectedMaterial}>
              Add to cart
            </button>

            {cartCount > 0 && (
              <button className="checkout-btn" onClick={checkout} disabled={checkingOut}>
                {checkingOut ? 'Redirecting to payment…' : `Checkout (${cartCount} item${cartCount > 1 ? 's' : ''})`}
              </button>
            )}

            <div className="product-specs">
              {[
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

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>
    </>
  )
}
