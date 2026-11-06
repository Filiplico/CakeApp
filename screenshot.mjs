import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:/Users/filip/CakeApp/screenshots/home.png', fullPage: false });
console.log('Home page captured');

await page.goto('http://localhost:5173/cakes', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:/Users/filip/CakeApp/screenshots/cakes.png', fullPage: false });
console.log('Cakes page captured');

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
if (errors.length) console.error('Console errors:', errors.join('\n'));
else console.log('No console errors');

await browser.close();
