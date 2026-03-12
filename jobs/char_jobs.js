import HTMLParser from 'node-html-parser'
import webReader from '../utils/web_reader.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class charJobs {
  static #addURL = 'https://deadbydaylight.fandom.com'

  // Characters
  static #charactersURL = 'https://deadbydaylight.fandom.com/wiki/Characters'
  static #survivorsSelector = "h2:has(span[id='Survivors'])+dl+div"
  static #killersSelector = "h2:has(span[id='Killers'])+dl+div"

  static #retrieveCharacters(selector) {
    if (!selector) { return false }

    return new Promise((resolve, reject) => {
      webReader.readWebsite(this.#charactersURL).then((data) => {
        const Characters = []
        const parsedHTML = HTMLParser.parse(data)

        const CharTable = parsedHTML.querySelector(selector)

        const isKiller = selector === this.#killersSelector

        if (!CharTable) {
          reject(new Error('HTML table with characters not found.'))
          return
        }

        // Filter to only element nodes (skip text nodes)
        const charDivs = CharTable.childNodes.filter(node => node.nodeType === 1)

        charDivs.forEach(charDiv => {
          if (!charDiv.childNodes?.length >= 2) { return }

          // Character Info - first <a> tag has the character name
          const charA = charDiv.querySelector('a')
          if (!charA) { return }

          const characterName = charA.innerText?.trim()
          if (!characterName) { return }

          let killerName

          if (isKiller) {
            // Killer name appears as text after the character name link
            // e.g., "Evan MacMillan" link followed by "The Trapper" text
            const fullText = charDiv.innerText?.trim() || ''
            // The killer name is everything after the character name
            killerName = fullText.replace(characterName, '').trim()
          }

          const URIName = charA.attributes.href?.split('/').pop()
          const characterLink = this.#addURL + charA.attributes.href

          // Character Image - find img with data-src attribute
          const img = charDiv.querySelector('img[data-src]')
          const characterImage = img?.attributes['data-src']

          const characterData = { name: characterName, killerName, URIName, iconURL: characterImage, link: characterLink }

          Characters.push(characterData)
        })

        if (Characters.length) { resolve(Characters) } else { reject(new Error('No characters found.')) }
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

  static async retrieveSurvivors() {
    try {
      const survivors = await this.#retrieveCharacters(this.#survivorsSelector)
      const dataDir = await this.ensureDataDir()
      await fs.writeFile(path.join(dataDir, 'survivors.json'), JSON.stringify({ survivors }, null, 2))
      console.log('Successfully fetched and saved Survivors to survivors.json.')
    } catch (error) {
      throw new Error('Failed fetching Survivors: ' + error.message)
    }
  }

  static async retrieveKillers() {
    try {
      const killers = await this.#retrieveCharacters(this.#killersSelector)
      const dataDir = await this.ensureDataDir()
      await fs.writeFile(path.join(dataDir, 'killers.json'), JSON.stringify({ killers }, null, 2))
      console.log('Successfully fetched and saved Killers to killers.json.')
    } catch (error) {
      throw new Error('Failed fetching Killers: ' + error.message)
    }
  }

  static updateKillersAndSurvivors() {
    console.log('Updating character database local files...')
    return new Promise((resolve, reject) => {
      try {
        Promise.all([this.retrieveSurvivors(), this.retrieveKillers()]).then(() => {
          resolve('Successfully updated character files')
        })
      } catch (error) {
        reject(new Error('Character files update failed'))
      }
    })
  }
}

export default charJobs
