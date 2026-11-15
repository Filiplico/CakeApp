import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import CakeDetails from './pages/CakeDetails'
import Cakes from './pages/Cakes'
import Contact from './pages/Contact'
import Home from './pages/Home'

// The cake builder pulls in three.js, so it is only downloaded when someone opens it.
const CustomOrder = lazy(() => import('./pages/CustomOrder'))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cakes" element={<Cakes />} />
        <Route path="/cakes/:id" element={<CakeDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/custom-order"
          element={
            <Suspense fallback={<main className="studio" aria-busy="true" />}>
              <CustomOrder />
            </Suspense>
          }
        />
      </Routes>
      <Footer />
    </>
  )
}
