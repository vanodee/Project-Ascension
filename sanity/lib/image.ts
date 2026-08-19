import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from './client'

const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

/** Resolves a Sanity image field to a CDN URL, sized and format-optimized. */
export function imageUrl(source: SanityImageSource, width: number): string {
  return urlFor(source).width(width).auto('format').fit('max').url()
}
