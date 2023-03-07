import chalk from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { listDir, readFile } from "../lib/filesystem.js";
import { getExistingAsset } from "../lib/findInContentful.js";
import { getSourceDir } from "../mappings/migrationMapping.js";
import {
  createNewAsset,
  updateExistingAsset,
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

      // Prevent errors by returning early if image_id is not present.
      // I.e. if image_id is not present, there is no image to grab.
      if (data.image_id === null) return;

      // Check if asset we are attempting to migrate already exists.
      let existingAsset = await getExistingAsset(data.image_id);
      // If asset already exists, update the asset;
      // otherwise, create and return a new asset.
      if (existingAsset) {
        updateExistingAsset(type, existingAsset.sys.id, data);
      } else {
        createNewAsset(type, data);
      }
    });
};

(async function () {
  // Since we're only migrating one asset type, for simplicity we are not allowing a "type" to be set
  // here (like we do for entries). Instead, we are hardcoding it (see mappings/migrationMapping.js).
  migrateFromPath("artworkAsset");
})();
