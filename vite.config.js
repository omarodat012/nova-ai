import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const GALLERIES_MODULE = 'virtual:achievement-galleries';
const RESOLVED_GALLERIES_MODULE = `\0${GALLERIES_MODULE}`;
const GALLERIES_URL = '/assets/achievements';
const GALLERY_IMAGE = /\.(jpe?g|png|webp)$/i;
// Natural order, so 2.jpg comes before 10.jpg.
const byName = new Intl.Collator('en', { numeric: true, sensitivity: 'base' }).compare;

// Exposes the event photo folders in public/assets/achievements as `virtual:achievement-galleries`:
// { 'zaka-event': ['/assets/achievements/zaka-event/1.jpg', ...], 'year/event': [...] }.
// Keys are folder paths relative to that directory; values are URL-encoded image paths in natural order.
function achievementGalleries() {
  let galleriesDir;

  const scan = () => {
    const galleries = {};
    const visit = (directory, segments) => {
      const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => byName(a.name, b.name));
      const images = entries
        .filter((entry) => entry.isFile() && GALLERY_IMAGE.test(entry.name))
        .map((entry) => [GALLERIES_URL, ...[...segments, entry.name].map(encodeURIComponent)].join('/'));

      if (segments.length > 0 && images.length > 0) galleries[segments.join('/')] = images;
      entries
        .filter((entry) => entry.isDirectory())
        .forEach((entry) => visit(path.join(directory, entry.name), [...segments, entry.name]));
    };

    if (fs.existsSync(galleriesDir)) visit(galleriesDir, []);
    return galleries;
  };

  return {
    name: 'nova-achievement-galleries',
    configResolved(config) {
      galleriesDir = path.resolve(config.publicDir, GALLERIES_URL.slice(1));
    },
    resolveId(id) {
      return id === GALLERIES_MODULE ? RESOLVED_GALLERIES_MODULE : null;
    },
    load(id) {
      return id === RESOLVED_GALLERIES_MODULE ? `export default ${JSON.stringify(scan())};` : null;
    },
    // In dev, adding or removing photos or folders rebuilds the list and reloads the page.
    configureServer(server) {
      let timer;
      const refresh = (file) => {
        const relative = path.relative(galleriesDir, file);
        if (relative.startsWith('..') || path.isAbsolute(relative)) return;

        // One reload for a whole batch of dropped photos.
        clearTimeout(timer);
        timer = setTimeout(() => {
          const { moduleGraph, hot } = server.environments.client;
          const module = moduleGraph.getModuleById(RESOLVED_GALLERIES_MODULE);
          if (!module) return;
          moduleGraph.invalidateModule(module);
          hot.send({ type: 'full-reload' });
        }, 150);
      };

      ['add', 'unlink', 'addDir', 'unlinkDir'].forEach((event) => server.watcher.on(event, refresh));
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the site from /nova-ai/ (the repository name); everywhere else it runs at the root.
  base: '/',
  plugins: [react(), tailwindcss(), achievementGalleries()],
  build: {
    // The Firestore SDK is a single ~500 kB library (150 kB gzipped) that cannot be split any further.
    chunkSizeWarningLimit: 550,
    rolldownOptions: {
      output: {
        // Firebase and the UI libraries change far less often than the app, so they get their own cacheable chunks.
        codeSplitting: {
          groups: [
            { name: 'firebase-firestore', test: /node_modules[\\/]@firebase[\\/]firestore[\\/]/, priority: 30 },
            { name: 'firebase', test: /node_modules[\\/](firebase|@firebase)[\\/]/, priority: 20 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
});
