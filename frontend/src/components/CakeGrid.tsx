import { getProducts } from '../api'
import { useApi } from '../hooks/useApi'
import { useFadeIn } from '../hooks/useFadeIn'
import CakeCard from './CakeCard'

interface Props {
  className: string
  /** Shows only the first few cakes. */
  limit?: number
}

/** The cake catalogue from the API, with loading and error states. */
export default function CakeGrid({ className, limit }: Props) {
  const products = useApi(getProducts)
  const fadeIn = useFadeIn()

  if (products.status === 'loading') {
    return <p className="catalogue-status">Loading our cakes…</p>
  }
  if (products.status === 'error') {
    return (
      <p className="catalogue-status" role="alert">
        We couldn't load our cakes right now. {products.message}
      </p>
    )
  }

  return (
    <div ref={fadeIn} className={`${className} reveal stagger`}>
      {products.data.slice(0, limit).map((cake) => (
        <CakeCard key={cake.id} cake={cake} />
      ))}
    </div>
  )
}
