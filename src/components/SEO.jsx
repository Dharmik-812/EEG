import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function setOrUpdateMeta(attr, key, value) {
  if (!value) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setOrUpdateLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function SEO({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  path,
}) {
  const location = useLocation()

  useEffect(() => {
    const siteName = 'AverSoltix'
    const baseTitle = title ? `${title} — ${siteName}` : siteName

    // Title
    if (baseTitle) document.title = baseTitle

    // Description
    setOrUpdateMeta('name', 'description', description)

    // Canonical
    const origin = window.location.origin
    const url = `${origin}${path || location.pathname}`
    setOrUpdateLink('canonical', url)

    // Robots
    setOrUpdateMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph
    setOrUpdateMeta('property', 'og:title', baseTitle)
    setOrUpdateMeta('property', 'og:description', description)
    setOrUpdateMeta('property', 'og:type', type)
    setOrUpdateMeta('property', 'og:url', url)
    if (image) setOrUpdateMeta('property', 'og:image', image)

    // Twitter
    setOrUpdateMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    setOrUpdateMeta('name', 'twitter:title', baseTitle)
    setOrUpdateMeta('name', 'twitter:description', description)
    if (image) setOrUpdateMeta('name', 'twitter:image', image)
  }, [title, description, image, type, noIndex, path, location.pathname])

  return null
}
