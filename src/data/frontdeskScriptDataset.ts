import rawScripts from './frontdesk-scripts.json' with { type: 'json' }
import { parseFrontdeskScriptDataset } from './validateFrontdeskScriptDataset.ts'

/** Staff scripts remain separate from the public hotel/facility datasets until the V2 staff UI is built. */
export const frontdeskScriptDataset = parseFrontdeskScriptDataset(rawScripts)
