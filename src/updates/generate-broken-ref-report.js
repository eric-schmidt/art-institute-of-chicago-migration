import chalk, { Chalk } from "chalk";
import { PromisePool } from "@supercharge/promise-pool";
import { client } from "../lib/cdaClient.js";
import { getArguments } from "../lib/commands.js";
import { createCSV } from "../lib/filesystem.js";

const generateBrokenRefReport = async (type) => {
  // Object to hold candidates with broken refs.
  const records = [["recordId", "Web App Link"]];

  const itemsPerPage = 100;

  let entries = await client.getEntries({
    content_type: "artwork",
    limit: itemsPerPage,
    skip: 0,
  });

  // Get the total number of pages so that we can iterate over all items.
  const totalPages = Math.ceil(entries.total / entries.limit);
  for (let i = 0; i <= totalPages; i++) {
    entries = await client.getEntries({
      content_type: "artwork",
      include: 1,
      select: "fields.primaryImage",
      limit: itemsPerPage,
      skip: itemsPerPage * i,
    });

    // Progress indicator.
    process.stdout.write(
      chalk.green(`Searched ${i} out of ${totalPages} pages... \r`)
    );

    if (entries.errors) {
      entries.errors.forEach(async (error) => {
        const parents = await client.getEntries({
          links_to_entry: error.details.id,
        });

        parents.items.forEach((item) => {
          let url = `https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT_ID}/entries/${item.sys.id}`;
          records.push([item.sys.id, url]);
        });
      });
    }
  }

  // Export records to a CSV for later operations.
  createCSV({ data: records, path: "broken-refs", filename: "artwork" });
};

(async function () {
  generateBrokenRefReport();
})();
