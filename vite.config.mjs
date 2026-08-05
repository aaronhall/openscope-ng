import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import handlebarsLayouts from 'handlebars-layouts';
import { defineConfig } from 'vite';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATE_ROOT = path.join(ROOT, 'src', 'templates');
const ENTRY_TEMPLATE = path.join(ROOT, 'src', 'index.hbs');

function compileMarkup() {
    const handlebars = Handlebars.create();
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

    handlebarsLayouts.register(handlebars);

    for (const filename of fs.readdirSync(TEMPLATE_ROOT)) {
        if (filename.endsWith('.hbs')) {
            handlebars.registerPartial(
                path.basename(filename, '.hbs'),
                fs.readFileSync(path.join(TEMPLATE_ROOT, filename), 'utf8')
            );
        }
    }

    const template = handlebars.compile(fs.readFileSync(ENTRY_TEMPLATE, 'utf8'));
    const markup = template({
        version: packageJson.version,
        buildDate: new Date().toUTCString(),
    });

    return markup
        .replace(
            /<link rel=['"]stylesheet['"] href=['"]assets\/style\/main\.min\.css\?=[^'"]+['"]\s*\/>/,
            '<link rel="stylesheet" href="/src/assets/style/main.less" />'
        )
        .replace(
            /<script src=['"]assets\/scripts\/client\/bundle\.min\.js\?v=[^'"]+['"]><\/script>/,
            '<script type="module" src="/src/assets/scripts/client/index.js"></script>'
        );
}

function handlebarsMarkupPlugin() {
    return {
        name: 'openscope-ng-handlebars-markup',
        transformIndexHtml: {
            order: 'pre',
            handler: () => compileMarkup(),
        },
        handleHotUpdate({ file, server }) {
            if (file === ENTRY_TEMPLATE || file.startsWith(`${TEMPLATE_ROOT}${path.sep}`)) {
                server.ws.send({ type: 'full-reload' });
            }
        },
    };
}

export default defineConfig({
    plugins: [handlebarsMarkupPlugin()],
    publicDir: `${ROOT}.vite-public`,
    server: {
        strictPort: true,
    },
    preview: {
        strictPort: true,
    },
    build: {
        outDir: `${ROOT}public`,
        emptyOutDir: true,
        sourcemap: true,
        target: 'es2015',
    },
});
