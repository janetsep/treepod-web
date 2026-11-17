import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const photos = new Set();

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(filename);
    else if (entry.name.endsWith('.tsx')) {
      const source = await readFile(filename, 'utf8');
      for (const section of source.matchAll(/<(?:CinematicSection|SeasonalLanding)\b[\s\S]*?\/>/g)) {
        for (const match of section[0].matchAll(/\bimage\s*(?:=|:)\s*["'](\/images\/[^"']+)["']/g)) photos.add(match[1]);
      }
      if (['HeroCarousel.tsx', 'TreePodDomes.tsx'].includes(entry.name)) {
        for (const match of source.matchAll(/\bsrc\s*(?:=|:)\s*["'](\/images\/[^"']+)["']/g)) photos.add(match[1]);
      }
    }
  }
}

await scan(path.join(root, 'app'));
const placeholders = {};
for (const photo of [...photos].sort()) {
  // Miniaturas de las fotos originales, no un color uniforme. Se generan una
  // vez y se incluyen en el HTML: no necesitan otra petición del visitante.
  const bytes = await sharp(path.join(root, 'public', photo))
    .rotate().resize({ width: 16, height: 16, fit: 'inside' })
    .jpeg({ quality: 40 }).toBuffer();
  placeholders[photo] = `data:image/jpeg;base64,${bytes.toString('base64')}`;
}
await writeFile(path.join(root, 'lib', 'image-placeholders.json'), `${JSON.stringify(placeholders, null, 2)}\n`);
console.log(`Generadas ${photos.size} vistas previas fotográficas.`);
