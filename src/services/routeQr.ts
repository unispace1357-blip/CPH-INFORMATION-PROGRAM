import qrcode from '../vendor/qrcode.mjs'
import { validatedNaverMapUrl } from './naverMapUrl.ts'

export interface PrintableQr { count: number; path: string; viewBox: string; url: string }
/** Local SVG QR path with four-module quiet zone; no third-party image service. */
export function makeRouteQr(value: unknown): PrintableQr | null {
  const url = validatedNaverMapUrl(value)
  if (!url) return null
  try {
    const qr = qrcode(0,'M')
    qr.addData(url,'Byte')
    qr.make()
    const count = qr.getModuleCount()
    if (count < 21 || count > 177) return null
    const dark: string[]=[]
    for(let y=0;y<count;y++) for(let x=0;x<count;x++){
      if(qr.isDark(y,x)) dark.push('M'+(x+4)+' '+(y+4)+'h1v1h-1z')
    }
    return {url,count,path:dark.join(''),viewBox:'0 0 '+(count+8)+' '+(count+8)}
  } catch { return null }
}
