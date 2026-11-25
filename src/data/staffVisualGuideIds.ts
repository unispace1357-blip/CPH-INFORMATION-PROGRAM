/** Only selected complex work articles get a visual guide. */
export const VISUAL_GUIDE_IDS = ["tv-remote","tv-general-reset","tv-smart-reset","tv-network","tv-optical","room-lights","door-lock","room-heating","smoke-window","skylight-remote","skylight-lights","parksuite-skylight","whirlpool-noise","room-type-change","elevator-room-assignment","smart-tv-pricing","room-views","request-amenities","voucher-steps","pet-policy","early-checkin","late-checkout"] as const
export function hasVisualGuide(id: string): boolean {
  return (VISUAL_GUIDE_IDS as readonly string[]).includes(id)
}
