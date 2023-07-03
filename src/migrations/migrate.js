import chalk from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { listDir, readFile, deleteFile } from "../lib/filesystem.js";
import { getArguments } from "../lib/commands.js";
import { migrateEntry } from "../lib/createInContentful.js";
import { getSourceDir } from "../mappings/migrationMapping.js";

// The number of concurrent Promises to run using the Promise Pool.
// If you are seeing a lot of rate limit errors, try decreasing.
const CONCURRENCY = 1;

// Migrate all content from a specific path (i.e. JSON data stored in this repo).
const migrateFromPath = async (type) => {
  const path = getSourceDir(type);
  const files = await listDir(path);

  // Run migration in batches using PromisePool to avoid excessive rate limit errors.
  await PromisePool.withConcurrency(CONCURRENCY)
    .for(files)
    .process(async (file) => {
      // Get source data from file.
      let data = await readFile(`${path}/${file}`);
      // Migrate top level entries within Promise Pool.
      await migrateEntry(type, data, "id");
      // When migrating the artwork content type, there are over 100k entries.
      // One hacky way to be able to resume the migration w/o re-running the
      // same entries is to just delete each file once migrated, then subsequent
      // migrations will only run on unmigrated content. It's helpful to copy
      // 'artworks' into a new directory when testing this.
      deleteFile(`${path}/${file}`);
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
