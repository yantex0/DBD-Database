import perkJobs from './jobs/perk_jobs.js'
import charJobs from './jobs/char_jobs.js'

async function runUpdate() {
  // Update characters first
  const charRes = await charJobs.updateKillersAndSurvivors()
  console.log(charRes)

  // Then update perks
  const perkRes = await perkJobs.updateKillerAndSurvivorPerks()
  console.log(perkRes)

  console.log('Database files update finished.')
  process.exit(0)
}

runUpdate().catch(err => {
  console.error('Update failed:', err)
  process.exit(1)
})
