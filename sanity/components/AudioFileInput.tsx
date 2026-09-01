import { useEffect, useRef } from 'react'
import { useClient, useFormValue, type FileInputProps } from 'sanity'

const API_VERSION = '2024-01-01'

/**
 * Wraps the default `audioFile` file input so that as soon as a recording
 * finishes uploading, its duration is read off the browser's own `<audio>`
 * element and patched straight onto the sibling `audioDurationSeconds`
 * field — no manual stopwatch-and-type-it-in step for editors.
 *
 * Reading `.duration` off an `<audio>` element doesn't require CORS (unlike
 * decoding raw sample data), so this works against the Sanity CDN as-is.
 */
export function AudioFileInput(props: FileInputProps) {
  const client = useClient({ apiVersion: API_VERSION })
  const documentId = useFormValue(['_id']) as string | undefined
  const assetRef = (props.value as { asset?: { _ref?: string } } | undefined)?.asset?._ref
  const lastComputedForRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!assetRef || !documentId) return
    if (lastComputedForRef.current === assetRef) return
    lastComputedForRef.current = assetRef

    let cancelled = false

    client
      .fetch<{ url?: string } | null>('*[_id == $id][0]{url}', { id: assetRef })
      .then((asset) => {
        if (cancelled || !asset?.url) return

        const audio = new Audio()
        audio.preload = 'metadata'
        audio.addEventListener('loadedmetadata', () => {
          if (cancelled || !Number.isFinite(audio.duration)) return
          client
            .patch(documentId)
            .set({ audioDurationSeconds: Math.round(audio.duration) })
            .commit({ autoGenerateArrayKeys: false })
            .catch(() => {
              // Non-fatal — the editor can still fill in the duration by hand.
            })
        })
        audio.src = asset.url
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [assetRef, documentId, client])

  return props.renderDefault(props)
}
