import type { FrontdeskScriptDataset } from '../types/frontdeskScript.ts'

/** Staff-only lazy load: Guest never requests the script dataset or its operational reminders. */
export async function loadFrontdeskScripts(
  load: () => Promise<{ frontdeskScriptDataset: FrontdeskScriptDataset }> = () => import('../data/frontdeskScriptDataset.ts'),
): Promise<FrontdeskScriptDataset> {
  return (await load()).frontdeskScriptDataset
}
