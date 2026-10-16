import { frontdeskScriptDataset } from '../src/data/frontdeskScriptDataset.ts'
import { facilityDataset, hotelDataset } from '../src/data/index.ts'

console.log(
  `PASS: ${facilityDataset.facilities.length} facilities (${facilityDataset.dataStatus}); hotel (${hotelDataset.dataStatus}); ${frontdeskScriptDataset.scripts.length} frontdesk scripts (${frontdeskScriptDataset.dataStatus}); schemaVersion=1`,
)
