/** Type declarations for locally vendored qrcode-generator (MIT). */
export interface QrCode {
  addData(data:string,mode?:'Numeric'|'Alphanumeric'|'Byte'|'Kanji'):void
  make():void
  getModuleCount():number
  isDark(row:number,col:number):boolean
}
export function qrcode(typeNumber:number, correction:'L'|'M'|'Q'|'H'):QrCode
export default qrcode
