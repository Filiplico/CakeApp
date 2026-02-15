import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cakes from './pages/Cakes'
import CakeDetails from './pages/CakeDetails'
import Contact from './pages/Contact'
import CustomOrder from './pages/CustomOrder'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cakes" element={<Cakes />} />
        <Route path="/cakes/:id" element={<CakeDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/custom-order" element={<CustomOrder />} />
      </Routes>
    </>
  )
}

export default App
