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
  deployment: {
    // Let Sanity keep the hosted Studio bundle patched without a redeploy.
    autoUpdates: true,
    // Pin the studio application so `sanity deploy` never prompts for it
    // (keeps non-interactive/checklist deploys from hanging).
    appId: 'kbc5hi6ct7n2p1lentfdzyjb',
  },
})
