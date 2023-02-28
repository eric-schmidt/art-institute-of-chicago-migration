import chalk from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import TurndownService from "turndown";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import { environment } from "./lib/contentful-environment.js";
import { readFile, listDir } from "./lib/filesystem.js";
import {
  getContentTypeDir,
  getFieldMapping,
} from "./mappings/migration-mappings.js";

// NOTE: When trying to recursively migrate content on the fly, you have to run everything very
// synchronously (i.e. one at a time), otherwise you may end up with duplicated entries.
// This won't work great with large datasets like this, as there are 122,000+ entries,
// which could take literal weeks to migrate. Instead, we migrate each content type
// individually, migrating child content types before parent content types.

// Determine if an entry already exists within Contentful.
// Returns the entry data if found, or null if no entry found.
export const getExistingEntry = async (contentType, id) => {
  const entries = await environment.getEntries({
    content_type: contentType,
    limit: 1,
    "fields.id": id,
  });

  if (entries.total > 0) {
    return {
      sys: {
        type: "Link",
        linkType: "Entry",
        id: entries.items[0].sys.id, // There will always only be be one result, so we can assume [0].
      },
    };
  }
};

export const getExistingEntries = async (contentType, idList) => {
  return await Promise.all(
    idList.map(async (id) => {
      return await getExistingEntry(contentType, id);
    })
  );
};

// Update an existing entry that has already been migrated, using updated field values.
export const updateExistingEntry = async (entryId, updatedEntry) => {
  return await environment
    .getEntry(entryId)
    .then((entry) => {
      entry.fields = updatedEntry.fields;
      entry.metadata = updatedEntry.metadata;
      return entry.update();
    })
    .then((entry) => {
      entry.publish();
      console.log(
        chalk.yellow(
          `Entry (${entry.sys.contentType.sys.id}) updated: ${entry.sys.id}`
        )
      );
      return entry.sys.id;
    });
};

// Migrate all content from a specific path (i.e. JSON data stored in this repo).
const migrateAllFromPath = async (contentType) => {
  const path = getContentTypeDir(contentType);
  const files = await listDir(path);

  // Run migration in batches using PromisePool to avoid excessive rate limit errors.
  await PromisePool.withConcurrency(1)
    .for(files)
    .process(async (file) => {
      // Get source data from file.
      let data = await readFile(`${path}/${file}`);
      // Check if entry we are attempting to migrate already exists.
      let existingEntry = await getExistingEntry(contentType, data.id);
      // If entry already exists, update the entry;
      // otherwise, create and return a new entry.
      if (existingEntry) {
        let updatedData = await getFieldMapping(contentType, data);
        updateExistingEntry(existingEntry.sys.id, updatedData);
      } else {
        environment
          .createEntry(contentType, await getFieldMapping(contentType, data))
          .then((entry) => {
            entry.publish();
            console.log(
              chalk.green(`Entry (${contentType}) created: ${entry.sys.id}`)
            );
          })
          .catch(console.error);
      }
    });
};

// Init turndown for converting HTML into Markdown.
const turndownService = new TurndownService();

export const createRichText = async (data) => {
  if (!data) {
    return null;
  }

  // First, convert HTML to Markdown.
  const markdown = await turndownService.turndown(data);

  // Next, convert Markdown to Rich Text.
  return await richTextFromMarkdown(markdown, async (node) => {
    // TODO: Processing for unsupported node types goes here.
    // E.g. creating imageWrappers for WYSIWYG images.
  });
};

// Get parameters from command.
// E.g. node index.js --type=artwork
const getArguments = () => {
  const argv = process.argv;
  let type;
  if (argv[2]) {
    const param = argv[2].split("=");
    if (param[0] == "--type") {
      type = param[1];
    }
  }
  return { type };
};

(async function () {
  const { type } = getArguments();

  if (type) {
    migrateAllFromPath(type);
  } else {
    console.log(
      chalk.red('Please specify a content type. E.g. "--type=artwork".')
    );
  }
})();
