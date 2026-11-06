import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <span className="footer__copy">
            &copy; {new Date().getFullYear()} Rene's Cakes. All rights reserved.
          </span>

          <nav className="footer__links">
            <Link to="/cakes">Cakes</Link>
            <Link to="/custom-order">Custom Order</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
