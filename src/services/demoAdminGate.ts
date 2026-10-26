/**
 * PUBLIC DEMO ONLY. This is an intentional UI convenience lock, NOT authentication.
 * Both the sample password and administrator JS are visible to any website visitor.
 * Do not use this for private or sensitive information.
 */
export const DEMO_ADMIN_PASSWORD = 'sjy@123456'
const SESSION_KEY = 'cph:public-demo:admin-unlocked:v1'
export function isDemoAdminPassword(value:string):boolean{
  return value === DEMO_ADMIN_PASSWORD
}
export function hasDemoAdminSession():boolean {
  try{return sessionStorage.getItem(SESSION_KEY)==='yes'}catch{return false}
}
export function grantDemoAdminSession():void {
  try{sessionStorage.setItem(SESSION_KEY,'yes')}catch{/* single-page only if storage unavailable */}
}
export function revokeDemoAdminSession():void {
  try{sessionStorage.removeItem(SESSION_KEY)}catch{/* no persistent session */}
}
