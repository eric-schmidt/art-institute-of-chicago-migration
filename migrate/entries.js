import chalk from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { listDir, readFile } from "../lib/filesystem.js";
import { getArguments } from "../lib/commands.js";
import { getExistingEntry } from "../lib/findInContentful.js";
import { getSourceDir } from "../mappings/migrationMapping.js";
import {
  createNewEntry,
  updateExistingEntry,
} from "../lib/createInContentful.js";

// Migrate all content from a specific path (i.e. JSON data stored in this repo).
const migrateFromPath = async (type) => {
  const path = getSourceDir(type);
  const files = await listDir(path);

  // Run migration in batches using PromisePool to avoid excessive rate limit errors.
  await PromisePool.withConcurrency(1)
    .for(files)
    .process(async (file) => {
      // Get source data from file.
      let data = await readFile(`${path}/${file}`);
      // Check if entry we are attempting to migrate already exists.
      let existingEntry = await getExistingEntry(type, data.id);
      // If entry already exists, update the entry;
      // otherwise, create and return a new entry.
      if (existingEntry) {
        updateExistingEntry(type, existingEntry.sys.id, data);
      } else {
        createNewEntry(type, data);
      }
    });
};

(async function () {
  const { type } = getArguments();

  if (type) {
    migrateFromPath(type);
  } else {
    console.log(
      chalk.red('Please specify a content type. E.g. "--type=artwork".')
    );
  }
})();
