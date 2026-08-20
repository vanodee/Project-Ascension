import { NextStudio } from 'next-sanity/studio'

export { metadata, viewport } from 'next-sanity/studio'
export const dynamic = 'force-static'

export default async function StudioPage() {
  // Dynamic import (not a static one gated by a runtime check) so the vision-tool
  // config — and the CodeMirror/GROQ bundle it pulls in — is a real, separate
  // code-split chunk that production builds never fetch, rather than dead code
  // left inside the same bundle (@sanity/vision has no sideEffects:false, so a
  // static import survives tree-shaking even when unused).
  const config =
    process.env.NODE_ENV === 'development'
      ? (await import('../../../sanity.config.dev')).default
      : (await import('../../../sanity.config')).default

  return <NextStudio config={config} />
}
