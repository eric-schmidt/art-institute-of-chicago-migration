import chalk, { Chalk } from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { client } from "../lib/cdaClient.js";
import { getArguments } from "../lib/commands.js";
import { createCSV } from "../lib/filesystem.js";

const generateOrphanReport = async (type) => {
  // Object to hold candidates for deletion.
  const orphans = [["entryId", "Web App Link"]];

  let entries = await client.getEntries({
    content_type: type,
    limit: 10,
    skip: 0,
  });

  // Get the total number of pages so that we can iterate over all items.
  const totalPages = Math.ceil(entries.total / entries.limit);
  const itemsPerPage = 100;
  for (let i = 0; i <= totalPages; i++) {
    entries = await client.getEntries({
      content_type: type,
      limit: itemsPerPage,
      skip: itemsPerPage * i,
    });

    // Run in batches using PromisePool to avoid excessive rate limit errors.
    // CONCURRENCY is the number of concurrent Promises to run using the Promise Pool.
    // If you are seeing a lot of rate limit errors, try decreasing this number.
    const CONCURRENCY = 10;
    await PromisePool.withConcurrency(CONCURRENCY)
      .for(entries.items)
      .process(async (entry) => {
        const parentEntries = await client.getEntries({
          links_to_entry: entry.sys.id,
        });
        // If the total of items referencing this entry is 0 is is a deletion candidate.
        if (parentEntries.total === 0) {
          // Add entry ID + a link to the entry for easier author review.
          orphans.push([
            entry.sys.id,
            `https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}/entries/${entry.sys.id}`,
          ]);
        }
      });
  }

  // Export orphans to a CSV for later operations.
  createCSV({ data: orphans, path: "orphans", filename: type });
};

(async function () {
  const { type } = getArguments();

  if (type) {
    generateOrphanReport(type);
  } else {
    console.log(
      chalk.red('Please specify a content type. E.g. "--type=imageWrapper".')
    );
  }
})();
