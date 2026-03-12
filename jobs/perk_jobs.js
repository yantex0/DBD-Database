import { stripHtml } from 'string-strip-html'
import HTMLParser from 'node-html-parser'
import webReader from '../utils/web_reader.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class perkJobs {
  static #addURL = 'https://deadbydaylight.fandom.com'

  // Perks
  static #perksURL = 'https://deadbydaylight.fandom.com/wiki/Perks'
  // Selectors use *= (contains) since IDs now include perk count e.g. "Survivor_Perks_(149)"
  static #survivorPerksSelector = "h3:has(span[id*='Survivor_Perks'])+table>tbody"
  static #killerPerksSelector = "h3:has(span[id*='Killer_Perks'])+table>tbody"

  static #retrievePerks(selector) {
    if (!selector) { return false }

    return new Promise((resolve, reject) => {
      webReader.readWebsite(this.#perksURL).then((data) => {
        const Perks = []
        const parsedHTML = HTMLParser.parse(data)

        const PerkTable = parsedHTML.querySelector(selector)

        if (!PerkTable) {
          reject(new Error('HTML table with perks not found.'))
          return
        }

        // Filter to only element nodes (skip text nodes)
        const tableRows = PerkTable.childNodes.filter(node => node.nodeType === 1)

        tableRows.forEach(tableRow => {
          const thElements = tableRow.querySelectorAll('th')
          const tdElements = tableRow.querySelectorAll('td')

          if (thElements.length < 2) { return }

          const iconA = thElements[0]?.querySelector('a')
          const nameA = thElements[1]?.querySelector('a')

          // Check if actual perk row (skip header row)
          if (!iconA || !nameA) { return }

          // Description is in the <td> element (no more .formattedPerkDesc class)
          const contentTd = tdElements[0]

          // Character is in the 3rd <th> element (index 2)
          const character = thElements[2]?.querySelector('a')

          // Icon URL is now in the href attribute of the <a> tag
          const perkIcon = iconA.attributes.href
          const perkName = nameA.text?.trim()
          const URIName = nameA.attributes.href?.split('/').pop()

          if (!contentTd || !perkName) { return }

          // Update internal links to be full URLs
          contentTd.querySelectorAll('a').forEach(link => {
            if (link.attributes.href && !link.attributes.href.startsWith('http')) {
              link.setAttribute('href', this.#addURL + link.attributes.href)
            }
          })

          const content = contentTd.innerHTML
          const perkData = { URIName, name: perkName, iconURL: perkIcon, content, contentText: stripHtml(content).result }

          if (character) {
            perkData.characterName = character.attributes.title
          }

          Perks.push(perkData)
        })

        if (Perks.length) { resolve(Perks) } else { reject(new Error('No perks found.')) }
      })
    })
  }

  static async ensureDataDir() {
    const dataDir = path.join(__dirname, '..', 'data')
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir)
    }
    return dataDir
  }

  static async retrieveSurvivorPerks() {
    try {
      const perks = await this.#retrievePerks(this.#survivorPerksSelector)
      const dataDir = await this.ensureDataDir()

      // Read current survivors to inject character link
      let characters = []
      try {
        const charData = await fs.readFile(path.join(dataDir, 'survivors.json'), 'utf8')
        characters = JSON.parse(charData).survivors
      } catch (e) {
        console.warn('survivors.json not found, skipping character lookup logic')
      }

      perks.forEach(perk => {
        if (perk.characterName) {
          const match = characters.find(c => c.name === perk.characterName)
          if (match) perk.character = match.URIName // using URIName as a safe reference ID
        }
      })

      await fs.writeFile(path.join(dataDir, 'survivor_perks.json'), JSON.stringify({ perks }, null, 2))
      console.log('Successfully fetched and saved Survivor perks.')
    } catch (error) {
      throw new Error('Failed fetching Survivor perks ' + error)
    }
  }

  static async retrieveKillerPerks() {
    try {
      const perks = await this.#retrievePerks(this.#killerPerksSelector)
      const dataDir = await this.ensureDataDir()

      let characters = []
      try {
        const charData = await fs.readFile(path.join(dataDir, 'killers.json'), 'utf8')
        characters = JSON.parse(charData).killers
      } catch (e) {
        console.warn('killers.json not found, skipping character lookup logic')
      }

      perks.forEach(perk => {
        if (perk.characterName) {
          // Killer link in DB uses 'killerName' but the html references it slightly differently sometimes
          const match = characters.find(c => c.name === perk.characterName || c.killerName === perk.characterName)
          if (match) perk.character = match.URIName
        }
      })

      await fs.writeFile(path.join(dataDir, 'killer_perks.json'), JSON.stringify({ perks }, null, 2))
      console.log('Successfully fetched and saved Killer perks.')
    } catch (error) {
      throw new Error('Failed fetching Killer perks ' + error)
    }
  }

  static updateKillerAndSurvivorPerks() {
    console.log('Updating perk local files...')
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.retrieveSurvivorPerks(), this.retrieveKillerPerks()]).then(() => {
          resolve('Successfully updated perk files')
        })
      } catch (error) {
        reject(new Error('Perk files update failed'))
      }
    })
  }
}

export default perkJobs
