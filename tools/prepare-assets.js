'use strict';

const fs = require('fs');
const path = require('path');
const showdown = require('showdown');

const ROOT = path.join(__dirname, '..');
const SOURCE_ASSETS = path.join(ROOT, 'assets');
const SOURCE_GUIDES = path.join(ROOT, 'documentation', 'airport-guides');
const STAGING = path.join(ROOT, '.vite-public');
const STAGING_ASSETS = path.join(STAGING, 'assets');

const STATIC_DIRECTORIES = ['airports', 'fonts', 'images', 'tutorial', 'autocomplete'];
const COLLECTIONS = [
    ['aircraft', 'aircraft.json'],
    ['airlines', 'airlines.json'],
];

function ensureDirectory(directory) {
    fs.mkdirSync(directory, { recursive: true });
}

function writeJson(filename, value) {
    ensureDirectory(path.dirname(filename));
    fs.writeFileSync(filename, JSON.stringify(value));
}

function walkFiles(directory) {
    const files = [];

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...walkFiles(filename));
        } else {
            files.push(filename);
        }
    }

    return files;
}

function copyStaticDirectories() {
    for (const directory of STATIC_DIRECTORIES) {
        fs.cpSync(path.join(SOURCE_ASSETS, directory), path.join(STAGING_ASSETS, directory), {
            recursive: true,
        });
    }
}

function minifyAirportData() {
    const airportDirectory = path.join(STAGING_ASSETS, 'airports');
    let minifiedFiles = 0;

    for (const filename of walkFiles(airportDirectory)) {
        const extension = path.extname(filename);
        const basename = path.basename(filename);

        if (!['.json', '.geojson'].includes(extension) || basename.startsWith('airportLoadList')) {
            continue;
        }

        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        fs.writeFileSync(filename, JSON.stringify(data));
        minifiedFiles += 1;
    }

    return minifiedFiles;
}

function assembleCollection(directory, outputFilename) {
    const sourceDirectory = path.join(SOURCE_ASSETS, directory);
    const output = [];

    for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
        if (!entry.isFile() || entry.name.includes(outputFilename)) {
            continue;
        }

        output.push(JSON.parse(fs.readFileSync(path.join(sourceDirectory, entry.name), 'utf8')));
    }

    writeJson(path.join(STAGING_ASSETS, directory, outputFilename), {
        [path.basename(outputFilename, '.json')]: output,
    });

    return output.length;
}

function assembleGuides() {
    const markdown = {};
    const converter = new showdown.Converter({
        tables: true,
        simpleLineBreaks: true,
    });

    for (const entry of fs.readdirSync(SOURCE_GUIDES, { withFileTypes: true })) {
        if (!entry.isFile() || entry.name.includes('airport-guide-directory')) {
            continue;
        }

        const fileData = fs.readFileSync(path.join(SOURCE_GUIDES, entry.name), 'utf8');
        if (!fileData) {
            continue;
        }

        markdown[entry.name.split('.')[0]] = fileData;
    }

    const guides = Object.fromEntries(
        Object.entries(markdown).map(([icao, source]) => [icao, converter.makeHtml(source)])
    );

    writeJson(path.join(STAGING_ASSETS, 'guides', 'guides.json'), guides);
    return Object.keys(guides).length;
}

function assembleChangelog() {
    const sourceMarkdown = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
    const entries = sourceMarkdown.split(/# [0-9]\.[0-9]+\.[0-9] \(.*\)/g);
    const latestEntry = entries[1];
    const converter = new showdown.Converter({ simpleLineBreaks: true });

    writeJson(path.join(STAGING_ASSETS, 'changelog.json'), {
        changelog: converter.makeHtml(latestEntry),
    });
}

function prepareAssets() {
    fs.rmSync(STAGING, { recursive: true, force: true });
    ensureDirectory(STAGING_ASSETS);
    copyStaticDirectories();

    const minifiedFiles = minifyAirportData();
    const collectionCounts = COLLECTIONS.map(([directory, outputFilename]) => [
        outputFilename,
        assembleCollection(directory, outputFilename),
    ]);
    const guideCount = assembleGuides();
    assembleChangelog();

    console.log(`Prepared ${minifiedFiles} airport JSON/GeoJSON files.`);
    for (const [filename, count] of collectionCounts) {
        console.log(`Assembled ${count} items into ${filename}.`);
    }
    console.log(`Assembled ${guideCount} airport guides.`);
}

prepareAssets();
