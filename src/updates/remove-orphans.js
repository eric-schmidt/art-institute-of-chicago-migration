import chalk, { Chalk } from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { environment } from "../lib/cmaEnvironment.js";
import { getArguments } from "../lib/commands.js";
import { readFile } from "../lib/filesystem.js";

const removeOrphans = async (type) => {
  const csvData = await readFile(`orphans/${type}.csv`);
  // Split csvData on line breaks to get each row.
  const rows = csvData.split("\n");
  // Run in batches using PromisePool to avoid excessive rate limit errors.
  // CONCURRENCY is the number of concurrent Promises to run using the Promise Pool.
  // If you are seeing a lot of rate limit errors, try decreasing this number.
  const CONCURRENCY = 3;
  await PromisePool.withConcurrency(CONCURRENCY)
    .for(rows)
    .process(async (row, index) => {
      // Skip 1st iteration so we don't capture the header.
      if (index !== 0) {
        // Record ID is the first column of each row.
        const recordId = row.split(",")[0];
        // Get the record, unpublish, then delete.
        const record =
          type === "asset"
            ? await environment.getAsset(recordId)
            : await environment.getEntry(recordId);
        await record.unpublish();
        await record.delete();

        // Progress indicator.
        process.stdout.write(
          chalk.green(
            `Deleted ${index} out of ${rows.length - 1} records... \r`
          )
        );
      }
    });
};

(async function () {
  const { type } = getArguments();

  if (type) {
    removeOrphans(type);
  } else {
    console.log(
      chalk.red('Please specify a content type. E.g. "--type=imageWrapper".')
    );
  }
})();
