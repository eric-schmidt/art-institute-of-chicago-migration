import fetch from "node-fetch";

// Some images return 404 or other errors, so we need to check that the status
// is 200 before proceeding with the migration to prevent Asset failures.
export const imageUrlStatusOk = async (image_id) =>
  await fetch(
    `https://www.artic.edu/iiif/2/${image_id}/full/1686,/0/default.jpg`
  ).then((response) => (response.status === 200 ? true : false));
