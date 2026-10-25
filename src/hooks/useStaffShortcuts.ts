import { useEffect, useState } from 'react'
import {
  readStaffShortcuts, writeStaffShortcuts, recordRecent, toggleFavorite, isFavorite, MAX_FAVORITES
} from '../services/staffShortcuts.ts'
import type { Shortcut } from '../services/staffShortcuts.ts'

/** Client-only, bounded and failure-tolerant storage for a shared front-desk PC. */
export function useStaffShortcuts() {
  const [data,setData] = useState(readStaffShortcuts)
  const [storageAvailable,setStorageAvailable] = useState(true)
  useEffect(()=>{setStorageAvailable(writeStaffShortcuts(data))},[data])
  return {
    data, storageAvailable,
    isFavorite: (item:Shortcut)=>isFavorite(data,item),
    canFavorite: data.favorites.length<MAX_FAVORITES,
    toggleFavorite:(item:Shortcut)=>setData(current=>toggleFavorite(current,item)),
    recordRecent:(item:Shortcut)=>setData(current=>recordRecent(current,item)),
    clear:()=>setData({favorites:[],recent:[]}),
  }
}
