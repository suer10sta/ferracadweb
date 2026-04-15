import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'http://localhost:5173/' });

  const urls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/contact', changefreq: 'weekly', priority: 0.3 },
    { url: '/fonctionnalites', changefreq: 'weekly', priority: 0.8 },
    { url: '/louer', changefreq: 'weekly', priority: 0.6 },
  ];

  const writeStream = createWriteStream(resolve(__dirname, '../../public/sitemap.xml'));
  sitemap.pipe(writeStream);

  urls.forEach((url) => sitemap.write(url));
  sitemap.end();

  await streamToPromise(sitemap);
}

generateSitemap();