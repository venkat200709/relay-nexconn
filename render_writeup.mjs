import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempDir = path.join(__dirname, '.temp_chrome_writeup_' + Date.now());

async function main() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    userDataDir: tempDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const htmlPath = path.join(__dirname, 'relay_submission_writeup.html');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  // Emulate print media
  await page.emulateMediaType('print');

  const pageInfo = await page.evaluate(() => {
    const pages = document.querySelectorAll('.page');
    return Array.from(pages).map((p, i) => {
      const rect = p.getBoundingClientRect();
      const content = p.querySelector('.page-content');
      const contentRect = content ? content.getBoundingClientRect() : null;
      const footer = p.querySelector('.footer');
      const footerRect = footer ? footer.getBoundingClientRect() : null;
      return {
        pageIndex: i + 1,
        pageHeight: rect.height,
        scrollHeight: p.scrollHeight,
        clientHeight: p.clientHeight,
        contentHeight: contentRect ? contentRect.height : 0,
        footerHeight: footerRect ? footerRect.height : 0,
        isOverflowing: p.scrollHeight > p.clientHeight + 2
      };
    });
  });

  console.log('Page info in print mode:', JSON.stringify(pageInfo, null, 2));

  const outputPath = path.join(__dirname, 'Relay_Nexconn_Build_Challenge_Writeup.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '12mm',
      right: '12mm',
    },
  });

  console.log('Writeup PDF generated at:', outputPath);

  // Now capture screenshots of each page in screen mode at A4 dimensions
  await page.emulateMediaType('screen');
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 }); // A4 at 96 DPI * 2

  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) {
    const screenshotPath = path.join(__dirname, `test_page_${i + 1}.png`);
    await pages[i].screenshot({ path: screenshotPath });
    console.log(`Saved screenshot test_page_${i + 1}.png`);
  }

  const diagram = await page.$('.diagram-box');
  if (diagram) {
    await diagram.screenshot({ path: path.join(__dirname, 'diagram_crop.png') });
    console.log('Saved diagram_crop.png');
  }

  await browser.close();

  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}
}

main().catch(console.error);
