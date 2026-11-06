import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : 'transparent'}`}>
        <div className="container">
          <Link to="/" className="navbar__logo" aria-label="Rene's Cakes">
            <img src="/logo.png" alt="Rene's Cakes" />
          </Link>

          <ul className="navbar__links">
            <li><Link to="/cakes">Our Cakes</Link></li>
            <li><Link to="/custom-order">Custom Order</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <Link to="/">Home</Link>
        <Link to="/cakes">Our Cakes</Link>
        <Link to="/custom-order">Custom Order</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </>
  )
}
