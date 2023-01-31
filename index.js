import chalk from 'chalk';
import TurndownService from 'turndown';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { environment } from './lib/contentful-environment.js';
import { readFile, listDir } from './lib/filesystem.js';
import { getFieldMapping } from './mappings/migration-mappings.js';

// Init constants.
const DATA_DIR = './artic-api-data/json';

// Content type mappings.
// TODO: Should we move this to migration-mappings.js?
const contentTypeDirs = {
  agent: `${DATA_DIR}/agents`,
  artworkType: `${DATA_DIR}/artwork-types`,
  gallery: `${DATA_DIR}/galleries`,
};

// Determine if an entry already exists within Contentful.
// Returns the entry data if found, or null if no entry found.
const getExistingEntry = async (contentType, id) => {
  const entry = await environment.getEntries({
    content_type: contentType,
    limit: 1,
    'fields.id': id,
  });

  return entry.total > 0 ? entry.items[0] : null;
};

// Migrate a single entry, first determining if it already exists or needs to be created.
export const migrateEntry = async (contentType, id) => {
  const existingEntry = await getExistingEntry(contentType, id);

  // TODO: Figure out why this fails when running multiple entry migrations at once -- it creates
  // multiple of the same entry because it's not synchronously creating referenced entries before
  // moving on. E.g. If 5 Artworks are queued up at once and have the same artist, 5 artist entries
  // are created because the artworks are queued before artists are created 🤔
  // Would Promise.all fix this?
  if (existingEntry) {
    return {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: existingEntry.sys.id,
      },
    };
  } else {
    let data = await fetchSourceDataById(contentType, id);
    data = await JSON.parse(data);

    return await environment
      // For reusability of the migrateEntry function, field mapping has been extrapolated out.
      // Need to pass the content type, as well as fetched data, to getFieldMapping().
      .createEntry(contentType, await getFieldMapping(contentType, data))
      // .then((entry) => entry.publish())
      .then((entry) => {
        console.log(chalk.green(`Entry (${contentType}) created: ${entry.sys.id}`));
        return {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: entry.sys.id,
          },
        };
      });
  }
};

// Run a migration for multiple entries, wrapped in Promise.all to account for using .map.
export const migrateEntries = async (contentType, idList) => await Promise.all(idList.map(async (id) => migrateEntry(contentType, id)));

// Fetch content from a single source file using a path (from mapping above) and id.
const fetchSourceDataById = async (contentType, id) => await readFile(`${contentTypeDirs[contentType]}/${id}.json`);

// Fetch all content from a specific path (i.e. JSON data stored in this repo).
const migrateAllFromPath = async (contentType, path) => {
  const files = await listDir(path);

  console.log(files.length);

  // TODO: Can we add batching logic here?
  // const filesSubset = files.slice(0, 1);
  const filesSubset = files.slice(11, 30);

  // TODO: For loop (not forEach) will wait for each step to complete, rather than async
  filesSubset.forEach(async (file) => {
    let data = await readFile(`${path}/${file}`);
    data = await JSON.parse(data);

    // If entry already exists (ID field in Contentful), bail out.
    // TODO: This can be extended to instead update existing entries.
    if (await getExistingEntry(contentType, data.id)) return;

    environment
      .createEntry(contentType, await getFieldMapping(contentType, data))
      .then((entry) => {
        // entry.publish();
        console.log(chalk.green(`Entry (${contentType}) created: ${entry.sys.id}`));
      })
      .catch(console.error);
  });
};

(async function () {
  migrateAllFromPath('artwork', `${DATA_DIR}/artworks`);
})();
