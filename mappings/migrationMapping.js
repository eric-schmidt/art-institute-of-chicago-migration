import { createRichText } from "../lib/createInContentful.js";
import {
  getExistingAsset,
  getExistingEntry,
  getExistingEntries,
} from "../lib/findInContentful.js";

// Get the correct data directory for a specific content type.
export const getSourceDir = (type) => {
  const dataDir = "./artic-api-data/json";
  const typeDirs = {
    agent: `${dataDir}/agents`,
    artworkAsset: `${dataDir}/artworks`,
    imageWrapper: `${dataDir}/artworks`,
    artwork: `${dataDir}/artworks`,
    artworkType: `${dataDir}/artwork-types`,
    categoryTerm: `${dataDir}/category-terms`,
    gallery: `${dataDir}/galleries`,
  };

  return typeDirs[type];
};

// Some source fields contain "null" strings. Rather than importing these,
// we should return undefined so that the field stays blank within Contentful.
const getDataOrUndefined = (data) => (data ? data : undefined);

// Get the Contentful field mapping for a specific content type.
export const getFieldMapping = async (type, data) => {
  switch (type) {
    // AGENT
    case "agent":
      return {
        fields: {
          id: {
            "en-US": data.id.toString(),
          },
          name: {
            "en-US": getDataOrUndefined(data.title),
          },
          sortableName: {
            "en-US": getDataOrUndefined(data.sort_title),
          },
          isArtist: {
            "en-US": getDataOrUndefined(data.is_artist),
          },
          birthDate: {
            "en-US": getDataOrUndefined(data.birth_date),
          },
          deathDate: {
            "en-US": getDataOrUndefined(data.death_date),
          },
          description: {
            "en-US": await createRichText(data.description),
          },
        },
      };

    // ARTWORK ASSETS
    case "artworkAsset":
      return {
        fields: {
          title: {
            "en-US": `${data.artist_title} | ${data.title}`,
          },
          file: {
            "en-US": {
              contentType: "image/jpeg",
              fileName: `${data.image_id}.jpg`,
              upload: `https://www.artic.edu/iiif/2/${data.image_id}/full/1686,/0/default.jpg`,
            },
          },
        },
      };
      break;

    // ARTWORK IMAGE WRAPPERS
    case "imageWrapper":
      return {
        fields: {
          id: {
            "en-US": data.id.toString(),
          },
          title: {
            "en-US": `${data.artist_title} | ${data.title}`,
          },
          image: {
            "en-US": await getExistingAsset(data.image_id),
          },
          alternativeText: {
            "en-US": data.thumbnail?.alt_text,
          },
        },
      };

    // ARTWORK ENTRIES
    case "artwork":
      return {
        fields: {
          id: {
            "en-US": data.id.toString(),
          },
          title: {
            "en-US": getDataOrUndefined(data.title),
          },
          alternateTitles: {
            "en-US": getDataOrUndefined(data.alt_titles),
          },
          // primaryImage: {
          //   "en-US": getExistingEntry("imageWrapper", data.id),
          // },
          boostRank: {
            "en-US": getDataOrUndefined(data.boost_rank),
          },
          startDate: {
            "en-US": getDataOrUndefined(data.date_start),
          },
          endDate: {
            "en-US": getDataOrUndefined(data.date_end),
          },
          displayDate: {
            "en-US": getDataOrUndefined(data.date_display),
          },
          gallery: {
            "en-US": data.gallery_id
              ? await getExistingEntry("gallery", data.gallery_id)
              : undefined,
          },
          artistsReference: {
            "en-US": data.artist_ids
              ? await getExistingEntries("agent", data.artist_ids)
              : undefined,
          },
          artistsDisplay: {
            "en-US": getDataOrUndefined(data.artist_display),
          },
          placeOfOrigin: {
            "en-US": getDataOrUndefined(data.place_of_origin),
          },
          dimensions: {
            "en-US": getDataOrUndefined(data.dimensions),
          },
          color: {
            "en-US": getDataOrUndefined(data.color),
          },
          artworkType: {
            "en-US": data.artwork_type_id
              ? await getExistingEntry("artworkType", data.artwork_type_id)
              : undefined,
          },
          department: {
            "en-US": data.department_id
              ? await getExistingEntry("categoryTerm", data.department_id)
              : undefined,
          },
          categories: {
            "en-US": data.category_ids
              ? await getExistingEntries("categoryTerm", data.category_ids)
              : undefined,
          },
          styles: {
            "en-US": data.style_ids
              ? await getExistingEntries("categoryTerm", data.style_ids)
              : undefined,
          },
          classifications: {
            "en-US": data.classification_ids
              ? await getExistingEntries(
                  "categoryTerm",
                  data.classification_ids
                )
              : undefined,
          },
          subjects: {
            "en-US": data.subject_ids
              ? await getExistingEntries("categoryTerm", data.subject_ids)
              : undefined,
          },
          materials: {
            "en-US": data.material_ids
              ? await getExistingEntries("categoryTerm", data.material_ids)
              : undefined,
          },
          techniques: {
            "en-US": data.technique_ids
              ? await getExistingEntries("categoryTerm", data.technique_ids)
              : undefined,
          },
        },
      };

    // ARTWORK TYPE
    case "artworkType":
      return {
        fields: {
          id: {
            "en-US": data.id.toString(),
          },
          title: {
            "en-US": getDataOrUndefined(data.title),
          },
        },
      };

    case "categoryTerm":
      return {
        fields: {
          id: {
            "en-US": data.id.toString(),
          },
          title: {
            "en-US": getDataOrUndefined(data.title),
          },
          subtype: {
            "en-US": getDataOrUndefined(data.subtype),
          },
        },
      };

    // GALLERY
    case "gallery":
      return {
        fields: {
          id: {
            "en-US": data.id.toString(),
          },
          title: {
            "en-US": getDataOrUndefined(data.title),
          },
          number: {
            "en-US": getDataOrUndefined(data.number),
          },
          floor: {
            "en-US": getDataOrUndefined(data.floor),
          },
          location: {
            "en-US": {
              lat: getDataOrUndefined(data.latitude),
              lon: getDataOrUndefined(data.longitude),
            },
          },
        },
      };
  }
};
