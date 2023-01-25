import fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';
import contentful from 'contentful-management';
import TurndownService from 'turndown';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';

// Init dotenv.
dotenv.config();

// Init const vars.
// const sourceDomain = 'https://dev-contentful-umami.pantheonsite.io';
// const contentTypes = {
//   article: {
//     entityType: 'node',
//     bundle: 'Article',
//     includedFields: ['field_media_image', 'field_media_image.field_media_image'],
//   },
// };

// Init Contentful client/environment.
const environment = await new contentful.createClient({
  accessToken: process.env.CONTENTFUL_CMA_TOKEN,
})
  .getSpace(process.env.CONTENTFUL_SPACE_ID)
  .then((space) => space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID))
  .then((env) => {
    return env;
  });

// Utility functions for reading a directory and its files.
const readFile = async (file) => {
  try {
    const data = await fs.readFile(file);
    return await data.toString();
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
  }
};

const listDir = async (path) => {
  try {
    return await fs.readdir(path);
  } catch (error) {
    console.error(`Error reading file directory: ${error.message}`);
  }
};

// Fetch content from a specific path (i.e. JSON data stored in this repo).
const migrateFromPath = async (contentType, path) => {
  const files = await listDir(path);

  // TODO: Can we add batching logic here?
  const filesSubset = files.slice(0, 1);

  filesSubset.forEach(async (file) => {
    let data = await readFile(`${path}/${file}`);
    data = await JSON.parse(data);

    console.log(data);

    // If entry already exists (ID field in Contentful), bail out.
    // TODO: This can be extended to instead update existing entries.
    if (await getExistingEntry(contentType, data.id)) return;

    environment
      .createEntry(contentType, {
        fields: {
          id: {
            'en-US': data.id.toString(),
          },
          title: {
            'en-US': data.title,
          },
          alternateTitles: {
            'en-US': data.alt_titles,
          },
          // primaryImage: {
          //   'en-US': data.image_id
          // },
          // alternateImages: {
          //   'en-US': data.alt_image_ids
          // },
          boostRank: {
            'en-US': data.boost_rank,
          },
        },
      })
      .then((entry) => {
        // entry.publish();
        console.log(chalk.green(`Entry (${contentType}) created: ${entry.sys.id}`));
      })
      .catch(console.error);
  });
};

// Determine if an entry already exists within Contentful.
// Returns the entry data if found, or null if no entry found.
const getExistingEntry = async (contentType, id) => {
  const entry = await environment.getEntries({
    content_type: contentType,
    limit: 1,
    'fields.id': id,
  });

  return entry.total > 0 ? entry.items[0] : null;
};

(async function () {
  migrateFromPath('artwork', 'artic-api-data/json/artworks');
  // const { data } = await migrateFromPath('artic-api-data/json/artworks');
})();

// // Migrate the media item, including the creation of the referenced image file.
// const migrateMedia = async (mediaType, { id, attributes, relationships }, included) => {
//   const imageWrapper = included.find((include) => include.id === relationships?.field_media_image.data.id);
//   const image = included.find((include) => include.id === imageWrapper?.relationships?.field_media_image.data.id);

//   // Get existing imageWrapper if it exists and return it,
//   // otherwise create and return it.
//   const existingEntry = await getExistingEntry(mediaType, imageWrapper.id);
//   return existingEntry
//     ? {
//         sys: {
//           type: 'Link',
//           linkType: 'Entry',
//           id: existingEntry.sys.id,
//         },
//       }
//     : await environment
//         .createEntry(mediaType, {
//           fields: {
//             title: {
//               'en-US': imageWrapper?.attributes.name,
//             },
//             image: {
//               'en-US': await createAsset(image),
//             },
//             alternativeText: {
//               'en-US': 'This is some alternative text.',
//             },
//             drupalUuid: {
//               'en-US': imageWrapper.id,
//             },
//           },
//         })
//         // .then((entry) => entry.publish())
//         .then((entry) => {
//           console.log(chalk.green(`Entry (${mediaType}) created: ${entry.sys.id}`));
//           return {
//             sys: {
//               type: 'Link',
//               linkType: 'Entry',
//               id: entry.sys.id,
//             },
//           };
//         });
// };

// // Create a new asset.
// // This assumes that imageWrappers are unique, so we don't check for uniqueness here.
// const createAsset = async (image) => {
//   return await environment
//     .createAsset({
//       fields: {
//         title: {
//           'en-US': image?.attributes.filename,
//         },
//         file: {
//           'en-US': {
//             contentType: image?.attributes.filemime,
//             fileName: image?.attributes.filename,
//             upload: `${sourceDomain}${image?.attributes.uri.url}`,
//           },
//         },
//       },
//     })
//     .then((asset) => asset.processForAllLocales())
//     // .then((asset) => asset.publish())
//     .then((asset) => {
//       console.log(chalk.green(`Asset created: ${asset.sys.id}`));
//       return {
//         sys: {
//           type: 'Link',
//           linkType: 'Asset',
//           id: asset.sys.id,
//         },
//       };
//     })
//     .catch(console.error);
// };

// // Init turndown for converting HTML into Markdown.
// const turndownService = new TurndownService();

// const createRichText = async (data) => {
//   if (!data) {
//     return null;
//   }
//   // First, convert HTML to Markdown.
//   const markdown = await turndownService.turndown(data);
//   // Next, convert Markdown to Rich Text.
//   return await richTextFromMarkdown(markdown, async (node) => {
//     // TODO: Processing for unsupported node types goes here.
//     // E.g. creating imageWrappers for WYSIWYG images.
//   });
// };

// (async function () {
//   const { data, included } = await fetchDrupalData('article');

//   data.map(async (entry) => {
//     // console.dir(await createRichText(entry.attributes.body.value), { depth: 5 });
//     // If entry already exists (based on Drupal UUID), bail out.
//     // TODO: This can be extended to instead update existing entries.
//     if (await getExistingEntry('article', entry.id)) return;

//     environment
//       .createEntry('article', {
//         fields: {
//           drupalUuid: {
//             'en-US': entry.id,
//           },
//           title: {
//             'en-US': entry.attributes.title,
//           },
//           body: {
//             'en-US': await createRichText(entry.attributes.body.value),
//           },
//           image: {
//             'en-US': await migrateMedia('imageWrapper', entry, included),
//           },
//           // ^^ this returns an object, like so:
//           // image: {
//           //   'en-US': {
//           //     sys: {
//           //       type: 'Link',
//           //       linkType: 'Entry',
//           //       id: '71xUe5rFNWkmdB6bI9hUqX',
//           //     },
//           //   },
//           // },
//         },
//       })
//       .then((entry) => {
//         // entry.publish();
//         console.log(chalk.green(`Entry (Article) created: ${entry.sys.id}`));
//       })
//       .catch(console.error);
//   });
// })();
