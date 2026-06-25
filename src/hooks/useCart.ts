import { useCallback, useEffect, useState } from 'react'
import { cartItemCount, readCart, type CartLine } from '@/lib/cartStorage'

export function useCart() {
  const [count, setCount] = useState(() => cartItemCount())
  const [lines, setLines] = useState<CartLine[]>(() => readCart())

  const refresh = useCallback(() => {
    setCount(cartItemCount())
    setLines(readCart())
  }, [])

  useEffect(() => {
    const on = () => refresh()
    window.addEventListener('woontegra-cart', on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener('woontegra-cart', on)
      window.removeEventListener('storage', on)
    }
  }, [refresh])

  return { count, lines, refresh }
}
