import { createRichText, getExistingEntry, getExistingEntries } from '../index.js';

// Get the correct data directory for a specific content type.
export const getContentTypeDir = (contentType) => {
  const dataDir = './artic-api-data/json';
  const contentTypeDirs = {
    agent: `${dataDir}/agents`,
    artwork: `${dataDir}/artworks`,
    artworkType: `${dataDir}/artwork-types`,
    categoryTerm: `${dataDir}/category-terms`,
    gallery: `${dataDir}/galleries`,
  };

  return contentTypeDirs[contentType];
};

// Some source fields contain "null" strings. Rather than importing these,
// we should return undefined so that the field stays blank within Contentful.
const getDataOrUndefined = (data) => (data ? data : undefined);

// Get the Contentful field mapping for a specific content type.
export const getFieldMapping = async (contentType, data) => {
  switch (contentType) {
    // AGENT
    case 'agent':
      return {
        fields: {
          id: {
            'en-US': data.id.toString(),
          },
          name: {
            'en-US': getDataOrUndefined(data.title),
          },
          sortableName: {
            'en-US': getDataOrUndefined(data.sort_title),
          },
          isArtist: {
            'en-US': getDataOrUndefined(data.is_artist),
          },
          birthDate: {
            'en-US': getDataOrUndefined(data.birth_date),
          },
          deathDate: {
            'en-US': getDataOrUndefined(data.death_date),
          },
          description: {
            'en-US': await createRichText(data.description),
          },
        },
      };

    // ARTWORK
    case 'artwork':
      return {
        fields: {
          id: {
            'en-US': data.id.toString(),
          },
          title: {
            'en-US': getDataOrUndefined(data.title),
          },
          alternateTitles: {
            'en-US': getDataOrUndefined(data.alt_titles),
          },
          // primaryImage: {
          //   'en-US': data.image_id
          // },
          // alternateImages: {
          //   'en-US': data.alt_image_ids
          // },
          boostRank: {
            'en-US': getDataOrUndefined(data.boost_rank),
          },
          startDate: {
            'en-US': getDataOrUndefined(data.date_start),
          },
          endDate: {
            'en-US': getDataOrUndefined(data.date_end),
          },
          displayDate: {
            'en-US': getDataOrUndefined(data.date_display),
          },
          // gallery: {
          //   'en-US': data.gallery_id ? await getExistingEntry('gallery', data.gallery_id) : undefined,
          // },
          artistsReference: {
            'en-US': data.artist_ids ? await getExistingEntries('agent', data.artist_ids) : undefined,
          },
          artistsDisplay: {
            'en-US': getDataOrUndefined(data.artist_display),
          },
          placeOfOrigin: {
            'en-US': getDataOrUndefined(data.place_of_origin),
          },
          dimensions: {
            'en-US': getDataOrUndefined(data.dimensions),
          },
          color: {
            'en-US': getDataOrUndefined(data.color),
          },
          // artworkType: {
          //   'en-US': data.artwork_type_id ? await getExistingEntry('artworkType', data.artwork_type_id) : undefined,
          // },
          // categories: {
          //   'en-US': data.category_ids,
          // },
        },
      };

    // ARTWORK TYPE
    case 'artworkType':
      return {
        fields: {
          id: {
            'en-US': data.id.toString(),
          },
          title: {
            'en-US': getDataOrUndefined(data.title),
          },
        },
      };

    case 'categoryTerm':
      return {
        fields: {
          id: {
            'en-US': data.id.toString(),
          },
          title: {
            'en-US': getDataOrUndefined(data.title),
          },
          subtype: {
            'en-US': getDataOrUndefined(data.subtype),
          },
        },
      };

    // GALLERY
    case 'gallery':
      return {
        fields: {
          id: {
            'en-US': data.id.toString(),
          },
          title: {
            'en-US': getDataOrUndefined(data.title),
          },
        },
      };
  }
};
