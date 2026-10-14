import { facilityDataset, hotelDataset } from '../src/data/index.ts'
import { validateProductionData } from '../src/data/validateProductionData.ts'

try {
  validateProductionData(facilityDataset, hotelDataset)
  console.log('PASS: production facilities and hotel information are ready for a deployment build')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
