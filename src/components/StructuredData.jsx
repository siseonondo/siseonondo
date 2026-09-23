import { useEffect } from 'react'

// Injects/updates a JSON-LD <script> tag identified by `id`. Pass `data: null` to skip
// (e.g. an Article schema before any writing exists) — nothing is written in that case.
export default function StructuredData({ id, data }) {
  useEffect(() => {
    if (!data) return undefined

    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)

    return () => {
      el?.remove()
    }
  }, [id, data])

  return null
}
