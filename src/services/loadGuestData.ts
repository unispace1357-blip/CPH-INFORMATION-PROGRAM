import type { FacilityDataset } from '../types/facility.ts'
import type { HotelDataset } from '../types/hotel.ts'

export async function loadGuestFacilities(load: () => Promise<{ facilityDataset: FacilityDataset }> = () => import('../data/facilityDataset.ts')): Promise<FacilityDataset> {
  return (await load()).facilityDataset
}

export async function loadGuestHotel(load: () => Promise<{ hotelDataset: HotelDataset }> = () => import('../data/hotelDataset.ts')): Promise<HotelDataset> {
  return (await load()).hotelDataset
}

export type GuestDataState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; dataset: T }
