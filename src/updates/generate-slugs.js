// Slug field was not added in the initial migration, so this
// script concatenates a URL-safe title + ID (for uniqueness
// when Artworks have duplicate titles).

import chalk, { Chalk } from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { environment } from "../lib/cmaEnvironment.js";

// Set default batch size.
const BATCH_SIZE = 100;

// Migrate all content from a specific path (i.e. JSON data stored in this repo).
const generateSlugs = async () => {
  // Get all artwork entries that do not have a Slug value.
  let entries = await environment.getEntries({
    content_type: "artwork",
    "fields.slug[exists]": false,
    limit: BATCH_SIZE,
    skip: 0,
  });

  // If there are no entries with a missing slug, log out a message.
  if (!entries.total) console.log(chalk.red(`No missing slugs found!`));

  // Set up pagination logic for batching over all entries.
  const totalPages = Math.ceil(entries.total / entries.limit);
  const itemsPerPage = BATCH_SIZE;

  for (let i = 0; i <= totalPages; i++) {
    entries = await environment.getEntries({
      content_type: "artwork",
      "fields.slug[exists]": false,
      limit: itemsPerPage,
      skip: itemsPerPage * i,
    });

    // Run in batches using PromisePool to avoid excessive rate limit errors.
    // CONCURRENCY is the number of concurrent Promises to run using the Promise Pool.
    // If you are seeing a lot of rate limit errors, try decreasing.
    const CONCURRENCY = 1;
    await PromisePool.withConcurrency(CONCURRENCY)
      .for(entries.items)
      .process(async (entry, index) => {
        // Create a URL-safe slug composed of the title and ID.
        const urlSafeSlug = slugify(
          // Trim title field to 250 chars so that we can fit inside CF Symbol field.
          `${entry.fields.title["en-US"].substring(0, 250)}-${
            entry.fields.id["en-US"]
          }`
        );
        // Update slug for entry and then publish.
        await environment.getEntry(entry.sys.id).then((entry) => {
          entry.fields.slug = {
            "en-US": urlSafeSlug,
          };
          entry.update().then((entry) => {
            entry.publish();

            // Progress indicator.
            process.stdout.write(
              chalk.green(
                `Slugs updated for ${itemsPerPage * i + index} out of ${
                  entries.total
                } entries... \r`
              )
            );
          });
        });
      });
  }
};

// Creates a URL-safe slug from a given string.
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

(async function () {
  generateSlugs();
})();
