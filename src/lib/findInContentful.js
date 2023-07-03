import { environment } from "./cmaEnvironment.js";

// Determine if an entry already exists within Contentful.
// Returns the entry data if found, or null if no entry found.
export const getExistingEntry = async (type, id) => {
  const entries = await environment.getEntries({
    content_type: type,
    limit: 1,
    "fields.id": id,
  });

  if (entries.total > 0) {
    return {
      sys: {
        type: "Link",
        linkType: "Entry",
        id: entries.items[0].sys.id, // There will always only be be one result, so we can assume [0].
      },
    };
  }
};

export const getExistingEntries = async (type, idList) => {
  return await Promise.all(
    idList.map(async (id) => {
      return await getExistingEntry(type, id);
    })
  );
};

// Determine if an asset already exists within Contentful.
// Returns the entry data if found, or null if no asset found.
// Filename is used for uniqueness, as it's already in use to
// make it easier to tie an asset to a wrapper entry.
export const getExistingAsset = async (id) => {
  const assets = await environment.getAssets({
    limit: 1,
    "fields.title": id,
  });

  if (assets.total > 0) {
    return {
      sys: {
        type: "Link",
        linkType: "Asset",
        id: assets.items[0].sys.id, // There will always only be be one result, so we can assume [0].
      },
    };
  }
};
