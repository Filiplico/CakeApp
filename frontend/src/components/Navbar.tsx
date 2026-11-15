import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/cakes', label: 'Our Cakes' },
  { to: '/custom-order', label: 'Custom Order' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : 'transparent'}`}>
        <div className="container">
          <Link to="/" className="navbar__logo" aria-label="Rene's Cakes" onClick={closeMenu}>
            <img src="/logo.png" alt="Rene's Cakes" />
          </Link>

          <ul className="navbar__links">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
      </div>
    </>
  )
}
