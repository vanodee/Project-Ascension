import { defineCliConfig } from 'sanity/cli'

// Used only by the Sanity CLI (`sanity dev`, `sanity build`, `sanity deploy`).
// projectId + dataset are public (see CLAUDE.md) so they are safe to inline here.
export default defineCliConfig({
  api: {
    projectId: 'p3p9t4z1',
    dataset: 'production',
  },
  // Hosted Studio URL: https://ascension-parish.sanity.studio
  studioHost: 'ascension-parish',
  // Let Sanity keep the hosted Studio bundle patched without a redeploy.
  deployment: { autoUpdates: true },
})
