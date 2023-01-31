import { migrateEntry, migrateEntries } from '../index.js';

export const getFieldMapping = async (contentType, data) => {
  switch (contentType) {
    // AGENT
    case 'agent':
      return {
        fields: {
          id: {
            'en-US': data.id ? data.id.toString() : undefined,
          },
          name: {
            'en-US': data.title ? data.title : undefined,
          },
          sortableName: {
            'en-US': data.sort_title ? data.sort_title : undefined,
          },
          isArtist: {
            'en-US': data.is_artist ? data.is_artist : undefined,
          },
          birthDate: {
            'en-US': data.birth_date ? data.birth_date : undefined,
          },
          deathDate: {
            'en-US': data.death_date ? data.death_date : undefined,
          },
          description: {
            'en-US': data.description ? data.description : undefined,
          },
        },
      };

    // ARTWORK
    case 'artwork':
      return {
        fields: {
          id: {
            'en-US': data.id ? data.id.toString() : undefined,
          },
          title: {
            'en-US': data.title ? data.title : undefined,
          },
          alternateTitles: {
            'en-US': data.alt_titles ? data.alt_titles : undefined,
          },
          // primaryImage: {
          //   'en-US': data.image_id
          // },
          // alternateImages: {
          //   'en-US': data.alt_image_ids
          // },
          boostRank: {
            'en-US': data.boost_rank ? data.boost_rank : undefined,
          },
          startDate: {
            'en-US': data.date_start ? data.date_start : undefined,
          },
          endDate: {
            'en-US': data.date_end ? data.date_end : undefined,
          },
          displayDate: {
            'en-US': data.date_display ? data.date_display : undefined,
          },
          gallery: {
            'en-US': data.gallery_id ? await migrateEntry('gallery', data.gallery_id) : undefined,
          },
          artistsReference: {
            'en-US': data.artist_ids ? await migrateEntries('agent', data.artist_ids) : undefined,
          },
          artistsDisplay: {
            'en-US': data.artist_display ? data.artist_display : undefined,
          },
          placeOfOrigin: {
            'en-US': data.place_of_origin ? data.place_of_origin : undefined,
          },
          dimensions: {
            'en-US': data.dimensions ? data.dimensions : undefined,
          },
          color: {
            'en-US': data.color ? data.color : undefined,
          },
          artworkType: {
            'en-US': data.artwork_type_id ? await migrateEntry('artworkType', data.artwork_type_id) : undefined,
          },
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
            'en-US': data.id ? data.id.toString() : undefined,
          },
          title: {
            'en-US': data.title ? data.title : undefined,
          },
        },
      };

    // GALLERY
    case 'gallery':
      return {
        fields: {
          id: {
            'en-US': data.id ? data.id.toString() : undefined,
          },
          title: {
            'en-US': data.title ? data.title : undefined,
          },
        },
      };
  }
};
