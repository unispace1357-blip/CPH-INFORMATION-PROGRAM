import { facilityDataset } from '../src/data/index.ts'

console.log(
  `PASS: ${facilityDataset.facilities.length} facilities; schemaVersion=${facilityDataset.schemaVersion}; dataStatus=${facilityDataset.dataStatus}`,
)
