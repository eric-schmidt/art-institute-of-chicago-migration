import { environment } from '../lib/cmaEnvironment.js';

// Set default batch size.
const BATCH_SIZE = 100;

// Migrate all content from a specific path (i.e. JSON data stored in this repo).
const testThrottle = async () => {
  let entries = await environment.getEntries({
    content_type: 'artwork',
    limit: BATCH_SIZE,
    skip: 0,
  });

  // Set up pagination logic for batching over all entries.
  const totalPages = Math.ceil(entries.total / entries.limit);
  const itemsPerPage = BATCH_SIZE;

  for (let i = 0; i <= totalPages; i++) {
    entries = await environment.getEntries({
      content_type: 'artwork',
      limit: itemsPerPage,
      skip: itemsPerPage * i,
    });

    entries.items.forEach((item) => {
      console.log(item.fields.title['en-US']);
    });
  }
};

(async function () {
  testThrottle();
})();
