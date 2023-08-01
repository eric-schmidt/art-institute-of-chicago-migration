import chalk, { Chalk } from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { client } from "../lib/cdaClient.js";
import { getArguments } from "../lib/commands.js";
import { createCSV } from "../lib/filesystem.js";

const generateOrphanReport = async (type) => {
  // Object to hold candidates for deletion.
  const orphans = [["recordId", "Web App Link"]];

  let records =
    type === "asset"
      ? await client.getAssets({
          limit: 10,
          skip: 0,
        })
      : await client.getEntries({
          content_type: type,
          limit: 10,
          skip: 0,
        });

  // Get the total number of pages so that we can iterate over all items.
  const totalPages = Math.ceil(records.total / records.limit);
  const itemsPerPage = 100;
  for (let i = 0; i <= totalPages; i++) {
    records =
      type === "asset"
        ? await client.getAssets({
            limit: itemsPerPage,
            skip: itemsPerPage * i,
          })
        : await client.getEntries({
            content_type: type,
            limit: itemsPerPage,
            skip: itemsPerPage * i,
          });

    // Run in batches using PromisePool to avoid excessive rate limit errors.
    // CONCURRENCY is the number of concurrent Promises to run using the Promise Pool.
    // If you are seeing a lot of rate limit errors, try decreasing this number.
    const CONCURRENCY = 10;
    await PromisePool.withConcurrency(CONCURRENCY)
      .useCorrespondingResults()
      .for(records.items)
      .process(async (record, index) => {
        const parents =
          type === "asset"
            ? await client.getEntries({
                links_to_asset: record.sys.id,
              })
            : await client.getEntries({
                links_to_entry: record.sys.id,
              });
        // If the total of items referencing this record is 0 it is a deletion candidate.
        if (parents.total === 0) {
          let orphanUrl = `https://app.contentful.com/spaces/${
            process.env.CONTENTFUL_SPACE_ID
          }/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}/${
            type === "asset" ? "assets" : "entries" // interpolate the correct value depending on type of record.
          }/${record.sys.id}`;
          // Add record ID + a link to the record for easier author review.
          orphans.push([record.sys.id, orphanUrl]);
        }

        // Progress indicator.
        process.stdout.write(
          chalk.green(
            `Searched ${itemsPerPage * i + index} out of ${
              records.total
            } records... \r`
          )
        );
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
