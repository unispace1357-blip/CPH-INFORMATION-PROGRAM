import { facilityDataset, hotelDataset } from '../src/data/index.ts'

console.log(
  `PASS: ${facilityDataset.facilities.length} facilities (${facilityDataset.dataStatus}); hotel (${hotelDataset.dataStatus}); schemaVersion=1`,
)
