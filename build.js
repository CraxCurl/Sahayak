import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  console.log('[Sahayak Build] Starting clean multi-target Chrome Extension build...');

  // 1. Build Side Panel React Application
  console.log('[Sahayak Build] Step 1: Building Side Panel Application...');
  await build({
    configFile: false,
    base: './',
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          sidepanel: resolve(__dirname, 'sidepanel.html')
        }
      }
    }
  });

  // 2. Build Service Worker (Single self-contained IIFE script)
  console.log('[Sahayak Build] Step 2: Building Service Worker (background.js)...');
  await build({
    configFile: false,
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/background/service-worker.ts'),
        name: 'SahayakBackground',
        formats: ['iife'],
        fileName: () => 'background.js'
      }
    }
  });

  // 3. Build Content Script (Single self-contained IIFE script, no code splitting)
  console.log('[Sahayak Build] Step 3: Building Content Script (content.js & content.css)...');
  await build({
    configFile: false,
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/content/index.ts'),
        name: 'SahayakContent',
        formats: ['iife'],
        fileName: () => 'content.js'
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'content.css';
            }
            return 'assets/[name].[ext]';
          }
        }
      }
    }
  });

  // 4. Copy manifest.json & icon assets into dist/icons
  console.log('[Sahayak Build] Step 4: Copying manifest.json and new extension logo icons...');
  fs.copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'));

  const distIconsDir = resolve(__dirname, 'dist/icons');
  const srcIconsDir = resolve(__dirname, 'icons');
  
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }

  // Copy all icons from icons/ to dist/icons/
  if (fs.existsSync(srcIconsDir)) {
    const files = fs.readdirSync(srcIconsDir);
    for (const file of files) {
      fs.copyFileSync(resolve(srcIconsDir, file), resolve(distIconsDir, file));
    }
  }

  console.log('[Sahayak Build] BUILD SUCCESSFUL! Chrome extension with new icons ready at C:\\SAHAYAK WORK\\dist');
}

runBuild().catch((err) => {
  console.error('[Sahayak Build] Error during build:', err);
  process.exit(1);
});
