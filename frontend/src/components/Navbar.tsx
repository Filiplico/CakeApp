import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">
          Renes Cakes
        </Link>
        <div>
          <Link to="/">Home</Link>
          <Link to="/cakes">Cakes</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </nav>
  )
}
