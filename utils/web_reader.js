import puppeteer from 'puppeteer'

class webReader {
  static async readWebsite(url) {
    let browser
    try {
      browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })

      const page = await browser.newPage()

      // Set a more natural user agent to reduce likelihood of blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

      // Navigate to the URL and wait for the network to be mostly idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

      // Extract the full HTML
      const html = await page.content()
      return html
    } catch (error) {
      console.error(`Failed to read website: ${url}`, error)
      throw error
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }
}

export default webReader
